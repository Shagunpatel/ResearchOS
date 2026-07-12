from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="AI research copilot backend",
    version="0.1.0",
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "ResearchOS API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}