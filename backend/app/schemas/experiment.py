from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ExperimentCreate(BaseModel):
    name: str
    model_name: str | None = None
    dataset: str | None = None
    hyperparameters: dict | None = None
    metrics: dict | None = None
    result_summary: str | None = None
    notes: str | None = None


class ExperimentRead(BaseModel):
    id: UUID
    name: str
    model_name: str | None = None
    dataset: str | None = None
    hyperparameters: dict | None = None
    metrics: dict | None = None
    result_summary: str | None = None
    notes: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }