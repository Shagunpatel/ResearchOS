from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.experiment import ExperimentCreate, ExperimentRead
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/experiments", tags=["Experiments"])


@router.post("", response_model=ExperimentRead)
async def create_experiment(
    payload: ExperimentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ExperimentService(db)

    return await service.create_experiment(
        payload=payload,
        current_user=current_user,
    )


@router.get("", response_model=list[ExperimentRead])
async def list_experiments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ExperimentService(db)

    return await service.list_experiments(current_user=current_user)


@router.get("/{experiment_id}", response_model=ExperimentRead)
async def get_experiment(
    experiment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ExperimentService(db)

    return await service.get_experiment(
        experiment_id=experiment_id,
        current_user=current_user,
    )


@router.put("/{experiment_id}", response_model=ExperimentRead)
async def update_experiment(
    experiment_id: UUID,
    payload: ExperimentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ExperimentService(db)

    return await service.update_experiment(
        experiment_id=experiment_id,
        payload=payload,
        current_user=current_user,
    )


@router.delete("/{experiment_id}")
async def delete_experiment(
    experiment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ExperimentService(db)

    return await service.delete_experiment(
        experiment_id=experiment_id,
        current_user=current_user,
    )