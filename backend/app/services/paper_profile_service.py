import json

from fastapi import HTTPException, status

from app.ai.llm.factory import get_llm_provider
from app.models.user import User
from app.repositories.paper_repository import PaperRepository


class PaperProfileService:
    def __init__(self, db):
        self.paper_repository = PaperRepository(db)
        self.llm = get_llm_provider()

    async def generate_profile(self, *, paper_id, current_user: User):
        paper = await self.paper_repository.get_by_id_for_user(
            paper_id=paper_id,
            user_id=current_user.id,
        )

        if paper is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paper not found",
            )

        if paper.profile:
            return paper.profile

        chunks = await self.paper_repository.list_chunks_for_paper(
            paper_id=paper.id,
            user_id=current_user.id,
        )

        text = "\n\n".join(chunk.text for chunk in chunks[:35])

        prompt = f"""
You are ResearchOS, an AI research analysis system.

Extract a structured research profile from the paper.

Do NOT output JSON.
Do NOT mention authors, affiliations, references, or biographies.

Return exactly this format:

Paper type:
Problem:
Main contribution:
Methodology:
Datasets / tools:
Metrics:
Key results:
Limitations:
Future work:
Keywords:

Rules:
- Be specific.
- If something is not discussed, write "Not discussed".
- Focus only on research content.

Paper text:
{text}
"""

        raw_response = self.llm.generate(prompt=prompt)

        profile = {
            "profile_text": raw_response
        }

        await self.paper_repository.update_profile(
            paper=paper,
            profile=profile,
        )

        await self.paper_repository.db.commit()

        return profile