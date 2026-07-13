from pydantic import BaseModel

from app.schemas.search import SemanticSearchResult


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SemanticSearchResult]