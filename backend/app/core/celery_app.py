from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "researchos",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.ingestion_tasks"],
)

celery_app.autodiscover_tasks(["app.tasks"])