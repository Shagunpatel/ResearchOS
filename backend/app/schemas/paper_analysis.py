from pydantic import BaseModel


class PaperSummaryResponse(BaseModel):
    paper_id: str
    title: str | None = None
    filename: str
    summary: str