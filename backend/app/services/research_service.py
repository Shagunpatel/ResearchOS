from uuid import UUID

from fastapi import HTTPException, status

from app.ai.llm.factory import get_llm_provider
from app.models.user import User
from app.repositories.paper_repository import PaperRepository
from app.schemas.research import ComparePapersResponse


class ResearchService:
    def __init__(self, db):
        self.paper_repository = PaperRepository(db)
        self.llm = get_llm_provider()

    async def compare_papers(
        self,
        *,
        paper_ids: list[str],
        current_user: User,
    ) -> ComparePapersResponse:
        papers_context = []

        for paper_id in paper_ids:
            paper = await self.paper_repository.get_by_id_for_user(
                paper_id=UUID(paper_id),
                user_id=current_user.id,
            )

            if paper is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Paper not found: {paper_id}",
                )

            if not paper.profile:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Generate profile first for {paper.filename}",
                )

            papers_context.append(
                f"""
            Paper: {paper.title or paper.filename}

            Research Profile:

            {paper.profile["profile_text"]}
            """
            )

        combined_context = "\n\n---\n\n".join(papers_context)

        prompt = f"""
You are ResearchOS, an AI research assistant.

You are given AI-generated research profiles of multiple papers.

Compare them.

Return exactly this structure:

# High-Level Comparison

# Problem Each Paper Solves

# Methodology Comparison

# Datasets / Experimental Setup

# Strengths

# Weaknesses

# Which paper is better for which use case?

# Final Recommendation

Profiles:

{combined_context}
"""

        comparison = self.llm.generate(prompt=prompt)

        return ComparePapersResponse(comparison=comparison)