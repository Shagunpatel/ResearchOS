import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.vectorstore.qdrant_service import QdrantService
from app.models.paper import PaperStatus
from app.models.user import User
from app.repositories.paper_repository import PaperRepository
from app.services.chunking_service import ChunkingService
from app.services.pdf_service import PDFService

UPLOAD_DIR = Path("storage/uploads")


class PaperService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.paper_repository = PaperRepository(db)

    async def upload_paper(
        self,
        *,
        file: UploadFile,
        current_user: User,
    ):
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

        safe_filename = (
            file.filename
            .replace("/", "_")
            .replace("\\", "_")
        )

        stored_filename = f"{uuid.uuid4()}_{safe_filename}"
        file_path = UPLOAD_DIR / stored_filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        paper = await self.paper_repository.create(
            user_id=current_user.id,
            filename=file.filename,
            file_path=str(file_path),
        )

        await self.db.commit()
        await self.db.refresh(paper)

        from app.tasks.ingestion_tasks import process_paper_task

        process_paper_task.delay(str(paper.id))

        return paper

    async def list_papers(self, *, current_user: User):
        return await self.paper_repository.list_by_user(
            current_user.id
        )

    async def get_paper(
        self,
        *,
        paper_id,
        current_user: User,
    ):
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

    async def delete_paper(
        self,
        *,
        paper_id,
        current_user: User,
    ):
        paper = await self.get_paper(
            paper_id=paper_id,
            current_user=current_user,
        )

        file_path = Path(paper.file_path)

        try:
            qdrant_service = QdrantService()

            qdrant_service.delete_paper_chunks(
                paper_id=str(paper.id),
                user_id=str(current_user.id),
            )

            await self.paper_repository.delete_chunks_for_paper(
                paper_id=paper.id,
                user_id=current_user.id,
            )

            await self.paper_repository.delete(paper)
            await self.db.commit()

        except Exception:
            await self.db.rollback()
            raise

        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                # Database and vector cleanup have succeeded.
                # A leftover local file should not fail the request.
                pass

        return {
            "message": "Paper deleted successfully",
            "paper_id": str(paper_id),
        }

    async def process_paper(self, paper):
        pdf_service = PDFService()
        chunking_service = ChunkingService()

        document = pdf_service.extract_document(paper.file_path)
        chunks = chunking_service.chunk_document(document["pages"])

        await self.paper_repository.update_paper_metadata(
            paper=paper,
            title=document["title"],
            authors=document["author"],
        )

        paper_chunks = await self.paper_repository.create_chunks(
            paper=paper,
            chunks=chunks,
        )

        qdrant_service = QdrantService()

        qdrant_chunks = [
            {
                "point_id": str(chunk.id),
                "text": chunk.text,
                "payload": {
                    "user_id": str(chunk.user_id),
                    "paper_id": str(chunk.paper_id),
                    "chunk_id": str(chunk.id),
                    "title": paper.title or paper.filename,
                    "filename": paper.filename,
                    "page_number": chunk.page_number,
                    "chunk_index": chunk.chunk_index,
                    "text": chunk.text,
                },
            }
            for chunk in paper_chunks
        ]

        qdrant_service.upsert_chunks(chunks=qdrant_chunks)

        await self.paper_repository.update_status(
            paper=paper,
            status=PaperStatus.READY,
        )

        await self.db.commit()

        return paper

    async def list_paper_chunks(
        self,
        *,
        paper_id,
        current_user: User,
    ):
        paper = await self.get_paper(
            paper_id=paper_id,
            current_user=current_user,
        )

        return await self.paper_repository.list_chunks_for_paper(
            paper_id=paper.id,
            user_id=current_user.id,
        )