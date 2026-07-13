from pydantic import BaseModel


class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 5


class SemanticSearchResult(BaseModel):
    score: float
    paper_id: str
    chunk_id: str
    title: str | None = None
    filename: str
    page_number: int | None = None
    chunk_index: int
    text: str


class SemanticSearchResponse(BaseModel):
    query: str
    results: list[SemanticSearchResult]