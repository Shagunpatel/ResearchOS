from pydantic import BaseModel, Field


class ComparePapersRequest(BaseModel):
    paper_ids: list[str] = Field(..., min_length=2)


class ComparePapersResponse(BaseModel):
    comparison: str


class RelatedWorkRequest(BaseModel):
    paper_ids: list[str] = Field(..., min_length=2)
    topic: str | None = None


class RelatedWorkResponse(BaseModel):
    related_work: str


class ResearchGapsRequest(BaseModel):
    paper_ids: list[str] = Field(..., min_length=2)
    topic: str | None = None


class ResearchGapsResponse(BaseModel):
    gaps: str