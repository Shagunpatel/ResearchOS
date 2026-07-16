from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.experiment_repository import ExperimentRepository
from app.schemas.experiment import ExperimentCreate


class ExperimentService:
    def __init__(self, db: AsyncSession):
        self.repository = ExperimentRepository(db)
        self.db = db

    async def create_experiment(
        self,
        *,
        payload: ExperimentCreate,
        current_user: User,
    ):
        experiment = await self.repository.create(
            user_id=current_user.id,
            payload=payload,
        )

        await self.db.commit()
        return experiment

    async def list_experiments(self, *, current_user: User):
        return await self.repository.list_for_user(user_id=current_user.id)

    async def get_experiment(
        self,
        *,
        experiment_id: UUID,
        current_user: User,
    ):
        experiment = await self.repository.get_by_id_for_user(
            experiment_id=experiment_id,
            user_id=current_user.id,
        )

        if experiment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experiment not found",
            )

        return experiment

    async def update_experiment(
        self,
        *,
        experiment_id: UUID,
        payload: ExperimentCreate,
        current_user: User,
    ):
        experiment = await self.get_experiment(
            experiment_id=experiment_id,
            current_user=current_user,
        )

        updated = await self.repository.update(
            experiment=experiment,
            payload=payload,
        )

        await self.db.commit()
        return updated

    async def delete_experiment(
        self,
        *,
        experiment_id: UUID,
        current_user: User,
    ):
        experiment = await self.get_experiment(
            experiment_id=experiment_id,
            current_user=current_user,
        )

        await self.repository.delete(experiment=experiment)
        await self.db.commit()

        return {"message": "Experiment deleted"}