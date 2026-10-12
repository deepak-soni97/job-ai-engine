import sys

print("Python executable:", sys.executable)

print("Importing packages...")
import fastapi
import uvicorn
import pydantic
import numpy as np
from sentence_transformers import SentenceTransformer
from fastapi.testclient import TestClient
from main import app

print(f"FastAPI version: {fastapi.__version__}")
print(f"Uvicorn version: {uvicorn.__version__}")
print(f"Pydantic version: {pydantic.__version__}")
print(f"NumPy version: {np.__version__}")
print("SentenceTransformer imported successfully!")

client = TestClient(app)
response = client.get("/health")
print("GET /health ->", response.status_code, response.json())
assert response.status_code == 200
assert response.json()["status"] == "healthy"
print("All checks passed successfully!")
