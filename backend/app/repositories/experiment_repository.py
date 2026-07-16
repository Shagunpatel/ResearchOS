from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.experiment import Experiment
from app.schemas.experiment import ExperimentCreate


class ExperimentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        *,
        user_id: UUID,
        payload: ExperimentCreate,
    ) -> Experiment:
        experiment = Experiment(
            user_id=user_id,
            name=payload.name,
            model_name=payload.model_name,
            dataset=payload.dataset,
            hyperparameters=payload.hyperparameters,
            metrics=payload.metrics,
            result_summary=payload.result_summary,
            notes=payload.notes,
        )

        self.db.add(experiment)
        await self.db.flush()
        await self.db.refresh(experiment)

        return experiment

    async def list_for_user(self, *, user_id: UUID) -> list[Experiment]:
        result = await self.db.execute(
            select(Experiment)
            .where(Experiment.user_id == user_id)
            .order_by(Experiment.created_at.desc())
        )

        return list(result.scalars().all())

    async def get_by_id_for_user(
        self,
        *,
        experiment_id: UUID,
        user_id: UUID,
    ) -> Experiment | None:
        result = await self.db.execute(
            select(Experiment).where(
                Experiment.id == experiment_id,
                Experiment.user_id == user_id,
            )
        )

        return result.scalar_one_or_none()

    async def update(
        self,
        *,
        experiment: Experiment,
        payload: ExperimentCreate,
    ) -> Experiment:
        experiment.name = payload.name
        experiment.model_name = payload.model_name
        experiment.dataset = payload.dataset
        experiment.hyperparameters = payload.hyperparameters
        experiment.metrics = payload.metrics
        experiment.result_summary = payload.result_summary
        experiment.notes = payload.notes

        await self.db.flush()
        await self.db.refresh(experiment)

        return experiment

    async def delete(self, *, experiment: Experiment) -> None:
        await self.db.delete(experiment)
        await self.db.flush()