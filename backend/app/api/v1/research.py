from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.research import (
    ComparePapersRequest,
    ComparePapersResponse,
    RelatedWorkRequest,
    RelatedWorkResponse,
    ResearchGapsRequest,
    ResearchGapsResponse,
)
from app.services.research_service import ResearchService

router = APIRouter(prefix="/research", tags=["Research"])


@router.post("/compare", response_model=ComparePapersResponse)
async def compare_papers(
    payload: ComparePapersRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResearchService(db)

    return await service.compare_papers(
        paper_ids=payload.paper_ids,
        current_user=current_user,
    )


@router.post("/related-work", response_model=RelatedWorkResponse)
async def generate_related_work(
    payload: RelatedWorkRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResearchService(db)

    return await service.generate_related_work(
        paper_ids=payload.paper_ids,
        topic=payload.topic,
        current_user=current_user,
    )


@router.post("/gaps", response_model=ResearchGapsResponse)
async def find_research_gaps(
    payload: ResearchGapsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResearchService(db)

    return await service.find_research_gaps(
        paper_ids=payload.paper_ids,
        topic=payload.topic,
        current_user=current_user,
    )