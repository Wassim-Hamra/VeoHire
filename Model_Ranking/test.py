from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

# Load the model
model = joblib.load('model.pkl')

# Define the expected feature names in the correct order
feature_names = [
    'Experience (Years)',
    'Projects Count',
    'Education_doctorat',
    'Education_licence',
    'Education_master',
    'Certifications_aws',
    'Certifications_google',
    'Job Role_ai',
    'Job Role_cybersecurity ',
    'Job Role_data science'
]

# Initialize FastAPI app
app = FastAPI()

# Define input data structure using Pydantic
class CVInput(BaseModel):
    experience_years: float
    education: str
    certifications: str
    job_role: str
    projects_count: int

@app.get("/")
def root():
    return {"message": "CV Ranking Model API is running!"}

@app.post("/predict")
def predict(cv: CVInput):
    try:
        # Extract input data and standardize the input values
        experience_years = cv.experience_years
        education = cv.education.strip().lower()
        certifications = cv.certifications.strip().lower()
        job_role = cv.job_role.strip().lower()
        projects_count = cv.projects_count

        # Create a dictionary to hold the features
        input_features = {
            'Experience (Years)': experience_years,
            'Projects Count': projects_count,
            'Education_doctorat': 0,
            'Education_licence': 0,
            'Education_master': 0,
            'Certifications_aws': 0,
            'Certifications_google': 0,
            'Job Role_ai': 0,
            'Job Role_cybersecurity ': 0,  # Ensure trailing space is included
            'Job Role_data science': 0
        }

        # Manually encode 'Education'
        if education == 'doctorat':
            input_features['Education_doctorat'] = 1
        elif education == 'licence':
            input_features['Education_licence'] = 1
        elif education == 'master':
            input_features['Education_master'] = 1
        # 'diplôme d'ingénieur' is the base category (not included)

        # Manually encode 'Certifications'
        if certifications == 'aws':
            input_features['Certifications_aws'] = 1
        elif certifications == 'google':
            input_features['Certifications_google'] = 1
        # Other certifications are considered the base category

        # Manually encode 'Job Role' with trailing space
        if job_role == 'ai':
            input_features['Job Role_ai'] = 1
        elif job_role == 'cybersecurity':
            input_features['Job Role_cybersecurity '] = 1  # Ensure trailing space
        elif job_role == 'data science':
            input_features['Job Role_data science'] = 1
        # Other job roles are considered the base category

        # Create a DataFrame for the input features
        input_df = pd.DataFrame([input_features])

        # Ensure the DataFrame columns match the expected feature names in the correct order
        input_df = input_df.reindex(columns=feature_names, fill_value=0)

        # Predict probability for the positive class (assuming class '1')
        proba = model.predict_proba(input_df)[0][0]

        # Return the probability as a JSON response
        return {"probability_of_acceptance": proba}

    except Exception as e:
        # Capture any exceptions and return an error message
        raise HTTPException(status_code=400, detail=str(e))
