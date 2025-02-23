from dotenv import load_dotenv
from fastapi import FastAPI
from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from fastapi.responses import JSONResponse
from typing import List
from openai import BaseModel
from pydantic import Field
load_dotenv()

class Contact(BaseModel):
    name: str = Field("Name of the person")
    email: str = Field("Email of the person")
    telephone: str = Field("Telephone number of the person")
    linkedin_url : str = Field("LinkedIn url of the person")
    github_url : str = Field("GitHub url of the person")

class Experience(BaseModel):
    title: str = Field("The title role related to the experience")
    company: str=Field("The company name related to the experience")
    bullet_points: List[str]=Field("Description of the experience")

class Education(BaseModel):
    institution: str=Field("The name of the institution that the person studied in")
    degree: str=Field("The degree name that the person got")


class JsonOutput(BaseModel):
    """Output message schema. Contains the data to be displayed to the user (if any)."""
    contact: Contact = Field("The contact info of the person")
    work_experience : List[Experience] = Field("The list of work experiences of the person")
    projects: List[str] = Field("The list of projects of the person")
    projects_count: int=Field("The number of projects that the person made")
    # education: Literal["Licence","Doctorat","Ingenieurie"] = Field("The type of degree that the person got")
    education_list: List[Education] = Field("The list of education of the person")
    skills: List[str] = Field("The list of skills/tools of the person")
class Data(BaseModel):
    cv_text: str

app = FastAPI()

# API Endpoint
@app.post("/getInfo")
async def get_info(data: Data):
    cv_text = data.cv_text
    llm = ChatOpenAI(model="gpt-4o")
    parser = JsonOutputParser(pydantic_object=JsonOutput)

    prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system",
             "You are a resume parser.Output JSON only. Extract resume data and always include 'contact_info' with 'name', 'email', 'phone', and 'address' (if found). if a value isnt found put 'NaN'"),
            MessagesPlaceholder(variable_name="messages"),
            ("system", "Take this resume text and extract from it the appropriate fields"
             ),
        ]
    )

    skills_extractor = prompt_template | llm | parser

    input_data = {"messages": [HumanMessage(content=cv_text)]}

    response = skills_extractor.invoke(input_data)
    return JSONResponse(content={"answer": response})