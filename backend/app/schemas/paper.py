from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.paper import PaperStatus


class PaperRead(BaseModel):
    id: UUID
    title: str | None = None
    authors: str | None = None
    year: int | None = None
    abstract: str | None = None
    filename: str
    status: PaperStatus
    error_message: str | None = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class PaperChunkRead(BaseModel):
    id: UUID
    paper_id: UUID
    chunk_index: int
    page_number: int | None = None
    text: str
    token_count: int | None = None

    model_config = {"from_attributes": True}