import os
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib

# ---------------------------
# Chatbot & LLM Setup
# ---------------------------
from transformers import pipeline

# Use DistilGPT-2 as a lightweight alternative for text generation
chatbot_model = pipeline(
    "text-generation",
    model="distilgpt2",
    device=0 if os.environ.get("USE_GPU") else -1
)

# ---------------------------
# Embeddings & FAISS Setup
# ---------------------------
from sentence_transformers import SentenceTransformer
import faiss

# Load a SentenceTransformer model for embedding (all-MiniLM-L6-v2 is small and fast)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
embedding_dim = 384  # Dimension for 'all-MiniLM-L6-v2'

# Initialize FAISS index (using L2 distance)
faiss_index = faiss.IndexFlatL2(embedding_dim)

# In-memory storage for feedback (for testing purposes; in production, use a proper database)
feedback_list = []    # To store feedback dictionaries
feedback_texts = []   # To store raw feedback texts

# ---------------------------
# MLflow & TensorFlow Setup
# ---------------------------
import mlflow
import tensorflow as tf
from tensorflow import keras

# Access Keras layers and models from TensorFlow
layers = keras.layers
models = keras.models

# ---------------------------
# FastAPI App Setup
# ---------------------------
app = FastAPI()

# ---------- Endpoint 1: Chatbot ----------
class ChatRequest(BaseModel):
    user_input: str

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    # Generate text based on user input (using DistilGPT-2)
    outputs = chatbot_model(request.user_input, max_length=100, do_sample=True)
    response_text = outputs[0]['generated_text']
    return {"response": response_text}
v
# ---------- Endpoint 2: Collect Feedback ----------
class FeedbackRequest(BaseModel):
    recruiter_id: str
    feedback_text: str
    rating: int  # For example, a rating on a scale of 1-5

@app.post("/feedback")
def feedback_endpoint(request: FeedbackRequest):
    feedback = {
        "recruiter_id": request.recruiter_id,
        "feedback_text": request.feedback_text,
        "rating": request.rating
    }
    feedback_list.append(feedback)
    
    # Compute embedding and add it to FAISS index
    emb = embedding_model.encode(request.feedback_text)
    emb = np.array([emb]).astype("float32")
    faiss_index.add(emb)
    feedback_texts.append(request.feedback_text)
    
    return {"message": "Feedback received successfully"}

# ---------- Endpoint 3: Feedback Search ----------
class FeedbackQuery(BaseModel):
    query: str
    top_k: int = 5

@app.post("/feedback/search")
def feedback_search(query: FeedbackQuery):
    query_emb = embedding_model.encode(query.query)
    query_emb = np.array([query_emb]).astype("float32")
    distances, indices = faiss_index.search(query_emb, query.top_k)
    
    results = []
    for idx in indices[0]:
        if idx < len(feedback_texts):
            results.append(feedback_texts[idx])
    return {"results": results}

# ---------- Endpoint 4: Dummy Retraining ----------
@app.post("/retrain")
def retrain_model():
    if len(feedback_list) < 5:
        raise HTTPException(status_code=400, detail="Not enough feedback to retrain the model.")
    
    X, y = [], []
    for fb in feedback_list:
        emb = embedding_model.encode(fb["feedback_text"])
        X.append(emb)
        y.append(fb["rating"])
    X = np.array(X)
    y = np.array(y)
    
    # Build a simple regression model using TensorFlow/Keras
    model_tf = models.Sequential([
        layers.Input(shape=(embedding_dim,)),
        layers.Dense(64, activation="relu"),
        layers.Dense(1, activation="linear")
    ])
    model_tf.compile(optimizer="adam", loss="mean_squared_error")
    
    # Track training with MLflow
    mlflow.start_run()
    model_tf.fit(X, y, epochs=10, batch_size=2, verbose=1)
    loss = model_tf.evaluate(X, y, verbose=0)
    mlflow.log_param("epochs", 10)
    mlflow.log_metric("loss", loss)
    mlflow.tensorflow.log_model(model_tf, "model_tf")
    mlflow.end_run()
    
    return {"message": "Model retrained with new feedback", "loss": loss}

# ---------------------------
# Run the App
# ---------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
