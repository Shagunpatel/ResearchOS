from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.paper import Paper


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
        await self.db.commit()
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

    async def delete(self, paper: Paper) -> None:
        await self.db.delete(paper)
        await self.db.commit()