from dotenv import load_dotenv
from fastapi import FastAPI, Request
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from fastapi.responses import JSONResponse
from typing import Literal
from openai import BaseModel
from pydantic import Field
load_dotenv()


class MLInput(BaseModel):
    """
    Populate this with the appropriate data based on the given person's info, if you don't know return a NaN
    """

    experience_years: int = Field(description="The number of work years of the person", le=0, ge=20)
    education: Literal["licence","master","doctorat","diplôme d'ingénieur"] = Field(description="The degree of the person")
    certifications: Literal["google","aws","ai"] = Field(description="The certification that the person got")
    job_role: Literal["ai","Software Engineer","data science","cybersecurity"] = Field(description="the job role of the person")
    projects_count: int = Field(description="how many projects the person did" ,le=0, ge=10)

app = FastAPI()

# API Endpoint
@app.post("/getMLinfo")
async def get_MLinfo(request: Request):
    data = await request.json()
    data = str(data)
    llm = ChatOpenAI(model="gpt-4o")
    prompt_template = ChatPromptTemplate([
        ("system",
         '''You will be getting information about a person's resume'''
         '''Your job is to answer in a specified json format based on the information given'''
         '''answer in this json format only: 
         {{
          "experience_years": calculate the experience years of the person based in their work experience,
          "education": choose between ["diplôme d'ingénieur","licence","master","doctorat"],
         "certifications": "choose between ["diplôme d'ingénieur","licence","master","doctorat"]",
         "job_role": "choose between ["ai","Software Engineer","data science","cybersecurity"]",
         "projects_count": calculate how many projects the person did
         }}
         if the data is missing return a NaN
         '''),
        MessagesPlaceholder(variable_name="messages"),
    ]
    )
    converter = prompt_template | llm.bind_tools(tools=[MLInput], tool_choice="MLInput")

    input_data = {"messages": [HumanMessage(content=data)]}

    response = converter.invoke(input_data)
    ml_json = response.tool_calls[0]["args"]

    return JSONResponse(ml_json)