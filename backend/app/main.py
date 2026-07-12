from fastapi import FastAPI

app = FastAPI(
    title="ResearchOS API",
    description="AI research copilot backend",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "ResearchOS API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}