from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.paper import PaperChunkRead, PaperRead
from app.services.paper_service import PaperService

router = APIRouter(prefix="/papers", tags=["Papers"])


@router.post("/upload", response_model=PaperRead)
async def upload_paper(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PaperService(db)
    return await service.upload_paper(file=file, current_user=current_user)


@router.get("", response_model=list[PaperRead])
async def list_papers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PaperService(db)
    return await service.list_papers(current_user=current_user)


@router.get("/{paper_id}/chunks", response_model=list[PaperChunkRead])
async def list_paper_chunks(
    paper_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PaperService(db)
    return await service.list_paper_chunks(
        paper_id=paper_id,
        current_user=current_user,
    )


@router.get("/{paper_id}", response_model=PaperRead)
async def get_paper(
    paper_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PaperService(db)
    return await service.get_paper(paper_id=paper_id, current_user=current_user)


@router.delete("/{paper_id}")
async def delete_paper(
    paper_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PaperService(db)
    return await service.delete_paper(paper_id=paper_id, current_user=current_user)