from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.paper import Paper, PaperChunk, PaperStatus


class PaperRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        *,
        user_id: UUID,
        filename: str,
        file_path: str,
    ) -> Paper:
        paper = Paper(
            user_id=user_id,
            filename=filename,
            file_path=file_path,
        )

        self.db.add(paper)
        await self.db.flush()
        await self.db.refresh(paper)

        return paper

    async def list_by_user(self, user_id: UUID) -> list[Paper]:
        result = await self.db.execute(
            select(Paper)
            .where(Paper.user_id == user_id)
            .order_by(Paper.uploaded_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id_for_user(self, paper_id: UUID, user_id: UUID) -> Paper | None:
        result = await self.db.execute(
            select(Paper).where(
                Paper.id == paper_id,
                Paper.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def update_paper_metadata(
        self,
        *,
        paper: Paper,
        title: str | None = None,
        authors: str | None = None,
        abstract: str | None = None,
        year: int | None = None,
    ) -> Paper:
        paper.title = title
        paper.authors = authors
        paper.abstract = abstract
        paper.year = year

        await self.db.flush()
        await self.db.refresh(paper)

        return paper

    async def update_status(
        self,
        *,
        paper: Paper,
        status: PaperStatus,
        error_message: str | None = None,
    ) -> Paper:
        paper.status = status
        paper.error_message = error_message

        await self.db.flush()
        await self.db.refresh(paper)

        return paper

    async def create_chunks(
        self,
        *,
        paper: Paper,
        chunks: list[dict],
    ) -> list[PaperChunk]:
        paper_chunks = [
            PaperChunk(
                paper_id=paper.id,
                user_id=paper.user_id,
                chunk_index=chunk["chunk_index"],
                page_number=chunk["page_number"],
                text=chunk["text"],
                token_count=chunk["token_count"],
            )
            for chunk in chunks
        ]

        self.db.add_all(paper_chunks)
        await self.db.flush()

        return paper_chunks

    async def list_chunks_for_paper(
        self,
        *,
        paper_id: UUID,
        user_id: UUID,
    ) -> list[PaperChunk]:
        result = await self.db.execute(
            select(PaperChunk)
            .where(
                PaperChunk.paper_id == paper_id,
                PaperChunk.user_id == user_id,
            )
            .order_by(PaperChunk.chunk_index.asc())
        )

        return list(result.scalars().all())

    async def delete(self, paper: Paper) -> None:
        await self.db.delete(paper)
        await self.db.flush()

    async def update_summary(
        self,
        *,
        paper: Paper,
        summary: str,
    ) -> Paper:
        paper.summary = summary

        await self.db.flush()
        await self.db.refresh(paper)

        return paper
    
    async def update_profile(
        self,
        *,
        paper: Paper,
        profile: dict,
    ) -> Paper:
        paper.profile = profile

        await self.db.flush()
        await self.db.refresh(paper)

        return paper