from pydantic import BaseModel, Field


class ComparePapersRequest(BaseModel):
    paper_ids: list[str] = Field(..., min_length=2)


class ComparePapersResponse(BaseModel):
    comparison: str