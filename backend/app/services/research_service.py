from uuid import UUID

from fastapi import HTTPException, status

from app.ai.llm.factory import get_llm_provider
from app.models.user import User
from app.repositories.paper_repository import PaperRepository
from app.schemas.research import (
    ComparePapersResponse,
    RelatedWorkResponse,
    ResearchGapsResponse,
)


class ResearchService:
    def __init__(self, db):
        self.paper_repository = PaperRepository(db)
        self.llm = get_llm_provider()

    async def _get_profile_context(
        self,
        *,
        paper_ids: list[str],
        current_user: User,
    ) -> str:
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

            if not paper.profile or not paper.profile.get("profile_text"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Generate profile first for {paper.filename}",
                )

            papers_context.append(
                f"""
Paper: {paper.title or paper.filename}
Filename: {paper.filename}

Research Profile:
{paper.profile["profile_text"]}
"""
            )

        return "\n\n---\n\n".join(papers_context)

    async def compare_papers(
        self,
        *,
        paper_ids: list[str],
        current_user: User,
    ) -> ComparePapersResponse:
        combined_context = await self._get_profile_context(
            paper_ids=paper_ids,
            current_user=current_user,
        )

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

    async def generate_related_work(
        self,
        *,
        paper_ids: list[str],
        topic: str | None,
        current_user: User,
    ) -> RelatedWorkResponse:
        combined_context = await self._get_profile_context(
            paper_ids=paper_ids,
            current_user=current_user,
        )

        topic_instruction = (
            f"The related work section should focus on this topic: {topic}."
            if topic
            else "Infer the main research theme from the provided papers."
        )

        prompt = f"""
You are ResearchOS, an AI research writing assistant.

Write a polished academic Related Work section using the paper profiles below.

{topic_instruction}

Rules:
- Write in formal academic style.
- Do not invent paper titles or citations.
- Refer to papers by their provided filenames or titles.
- Group papers by themes when possible.
- Explain how the papers relate to each other.
- End with a short paragraph explaining how this literature motivates future work.

Return only the Related Work section.

Paper profiles:

{combined_context}
"""

        related_work = self.llm.generate(prompt=prompt)

        return RelatedWorkResponse(related_work=related_work)

    async def find_research_gaps(
        self,
        *,
        paper_ids: list[str],
        topic: str | None,
        current_user: User,
    ) -> ResearchGapsResponse:
        combined_context = await self._get_profile_context(
            paper_ids=paper_ids,
            current_user=current_user,
        )

        topic_instruction = (
            f"Focus the gap analysis on this topic: {topic}."
            if topic
            else "Infer the shared research area from the provided papers."
        )

        prompt = f"""
You are ResearchOS, an AI research strategist.

Analyze the paper profiles below and identify research gaps.

{topic_instruction}

Return exactly this structure:

# Research Area Overview

# What Existing Papers Focus On

# Underexplored Research Gaps

# Limitations Across the Literature

# Promising Future Research Directions

# Possible Project Ideas

# Final Recommendation

Rules:
- Be specific.
- Do not invent papers.
- Ground your analysis in the provided profiles.
- Prefer actionable research directions a student or ML engineer could pursue.

Paper profiles:

{combined_context}
"""

        gaps = self.llm.generate(prompt=prompt)

        return ResearchGapsResponse(gaps=gaps)