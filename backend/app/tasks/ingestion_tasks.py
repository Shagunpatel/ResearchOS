import asyncio
from uuid import UUID

from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.models.paper import Paper
from app.services.paper_service import PaperService


@celery_app.task(name="process_paper_task")
def process_paper_task(paper_id: str) -> None:
    asyncio.run(_process_paper_async(paper_id))


async def _process_paper_async(paper_id: str) -> None:
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(Paper).where(Paper.id == UUID(paper_id))
            )
            paper = result.scalar_one_or_none()

            if paper is None:
                return

            service = PaperService(db)
            await service.process_paper(paper)

        except Exception:
            await db.rollback()
            raise