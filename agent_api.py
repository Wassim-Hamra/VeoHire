
from fastapi import FastAPI, Request
from langchain_openai import ChatOpenAI
from fastapi.responses import JSONResponse

llm = ChatOpenAI(model="gpt-4o", temperature=0)
from typing import List, Annotated, Sequence
from typing_extensions import TypedDict
from langgraph.graph import MessagesState
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage, HumanMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import json

class Evaluation(BaseModel):
  strengths: List[str] = Field(description="strengths of the candidate")
  weaknesses: List[str] = Field(description = "weaknesses of the candidate")
  overview: str = Field("A general description/overview of the candidate (2-3 sentences)")
  score: int = Field("Score based on job description")

class OverallState(MessagesState):
  job_title: str
  description: str
  qualifications: str
  cv: str
  evaluation: Evaluation
  critique: str
  class Config:
        arbitrary_types_allowed = True


def candidateEvaluator(state: OverallState) -> OverallState:
  job_title = state["job_title"]
  description = state["description"]
  qualifications = state["qualifications"]
  cv = state["cv"]
  prompt_template = ChatPromptTemplate.from_messages(
    [
        {
            "role": "system",
            "content": (
                "You are the candidate evaluator of a recruitment platform made by Veo Company. "
                "You will be given a job description and a JSON populated with the candidate information like skills, education, and work experience. "
                "Your job is to evaluate the candidate and decide whether they're a good candidate or not based on the job description."
            )
        },
        MessagesPlaceholder(variable_name="messages"),
        {
            "role": "system",
            "content": (
                "Decide whether or not this candidate is a good fit for the role by providing their strength points, weak points, "
                "a general description of their profile, and a score of their compatibility with the job description. "
                "Be severe and focus on technical skills especially. "
                "job title: {job_title}"
                "job description: {job_description}"
                "qualifcations: {qualifications}"
                "candidate's cv: {cv}"
            )
        },
    ]
  ).partial(job_title=job_title, job_description=description, qualifications=qualifications, cv=cv)
  evaluator = prompt_template | llm.bind_tools(tools=[Evaluation],tool_choice="Evaluation")
  response = evaluator.invoke([HumanMessage(content="here's the critique of the past evaluation {state['critique']}, improve on it")])
  response = response.additional_kwargs["tool_calls"][0]["function"]["arguments"]
  response = json.loads(response)
  state["evaluation"] = Evaluation(**response)
  return state

def Reviser(state: OverallState) -> OverallState:
  job_title = state["job_title"]
  description = state["description"]
  qualifications = state["qualifications"]
  cv = state["evaluation"]["cv"]
  strenghts = state["evaluation"]["strengths"]
  weaknesses = state["evaluation"]["weaknesses"]
  score = state["evaluation"]["score"]
  prompt_template = ChatPromptTemplate.from_messages(
    [
        {
            "role": "system",
            "content": (
                "You are the reviser of a candidate evaluation. You will get the strength and weaknesses of a profile "
                "based on a job description. Your job is to estimate whether this evaluation is good enough for the recruiter and provide critique for the evaluation."
            )
        },
        MessagesPlaceholder(variable_name="messages"),
        {
            "role": "system",
            "content": (
                "Provide critique for this evaluation based on these inputs:"
                "job title: {job_title}"
                "job description: {job_description}"
                "qualifcations: {qualifications}"
                "candidate's cv: {cv}"
            )
        },
    ]
  ).partial(job_title=job_title, job_description=description, qualifications=qualifications, cv=cv)
  reviser = prompt_template | llm
  response = reviser.invoke([HumanMessage(content="here is the evaluation: candidate weaknesses: {state['weaknesses']}, candidate strenghts:state['strengths'], candidate score: state['score']")])
  return {"critique": response.content}


MAX_ITERATIONS = 2
def event_loop(state: OverallState) -> str:
    state_msg = state["messages"]
    count_tool_visits = sum(isinstance(item, ToolMessage) for item in state_msg)
    num_iterations = count_tool_visits
    if num_iterations > MAX_ITERATIONS:
        return END
    return "Evaluate Candidate"


from langchain_core.messages import HumanMessage
from langgraph.graph import END, StateGraph, MessageGraph



builder = StateGraph(OverallState)

# Nodes
builder.add_node("Evaluate Candidate", candidateEvaluator)
# builder.add_node("Execute Tools", toolsExecutor)
# builder.add_node("Revise", Reviser)

# Edges
builder.set_entry_point("Evaluate Candidate")

# builder.add_conditional_edges("Evaluate Candidate", go_to_tools, ["Execute Tools", "Revise"])
# builder.add_edge("Evaluate Candidate", "Revise")
builder.add_edge("Evaluate Candidate", END)
# builder.add_edge("Execute Tools", "Evaluate Candidate")
# builder.add_conditional_edges("Revise", event_loop)


# Compiling
graph = builder.compile()




app = FastAPI()

# API Endpoint
@app.post("/getAgentinfo")
async def get_AgentInfo(request: Request):
    data = await request.json()
    job_title = data["title"]
    description = data["description"]
    qualifications = data["requirements"]
    cv = data["cv"]
    input_state = OverallState(
        job_title=job_title,
        description=description,
        qualifications=qualifications,
        cv=cv,
        evaluation=Evaluation(
            strengths=[],
            weaknesses=[],
            overview="",
        score =0),
        critique="",
        messages=[],
    )
    res = graph.invoke(input_state)
    return JSONResponse(content={"answer": res["evaluation"]})
