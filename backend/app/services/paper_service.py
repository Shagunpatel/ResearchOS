import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.paper_repository import PaperRepository

UPLOAD_DIR = Path("storage/uploads")


class PaperService:
    def __init__(self, db: AsyncSession):
        self.paper_repository = PaperRepository(db)

    async def upload_paper(self, *, file: UploadFile, current_user: User):
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must have a filename",
            )

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported",
            )

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        safe_filename = file.filename.replace("/", "_").replace("\\", "_")
        stored_filename = f"{uuid.uuid4()}_{safe_filename}"
        file_path = UPLOAD_DIR / stored_filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return await self.paper_repository.create(
            user_id=current_user.id,
            filename=file.filename,
            file_path=str(file_path),
        )

    async def list_papers(self, *, current_user: User):
        return await self.paper_repository.list_by_user(current_user.id)

    async def get_paper(self, *, paper_id, current_user: User):
        paper = await self.paper_repository.get_by_id_for_user(
            paper_id=paper_id,
            user_id=current_user.id,
        )

        if paper is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paper not found",
            )

        return paper

    async def delete_paper(self, *, paper_id, current_user: User):
        paper = await self.get_paper(paper_id=paper_id, current_user=current_user)

        file_path = Path(paper.file_path)
        if file_path.exists():
            file_path.unlink()

        await self.paper_repository.delete(paper)

        return {"message": "Paper deleted successfully"}