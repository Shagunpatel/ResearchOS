from fastapi import HTTPException, status

from app.ai.llm.factory import get_llm_provider
from app.models.user import User
from app.repositories.paper_repository import PaperRepository
from app.schemas.paper_analysis import PaperSummaryResponse


class PaperAnalysisService:
    def __init__(self, db):
        self.paper_repository = PaperRepository(db)
        self.llm = get_llm_provider()

    async def summarize_paper(self, *, paper_id, current_user: User):
        paper = await self.paper_repository.get_by_id_for_user(
            paper_id=paper_id,
            user_id=current_user.id,
        )

        if paper is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paper not found",
            )
        
        if paper.summary:
            return PaperSummaryResponse(
                paper_id=str(paper.id),
                title=paper.title or paper.filename,
                filename=paper.filename,
                summary=paper.summary,
            )

        chunks = await self.paper_repository.list_chunks_for_paper(
            paper_id=paper.id,
            user_id=current_user.id,
        )

        filtered_chunks = [
            chunk for chunk in chunks
            if not any(
                marker.lower() in chunk.text.lower()
                for marker in [
                    "references",
                    "biography",
                    "author biography",
                    "corresponding author",
                    "acknowledgement",
                    "acknowledgments",
                ]
            )
        ]

        paper_text = "\n\n".join(chunk.text for chunk in filtered_chunks[:30])

        if not paper_text.strip():
            paper_text = "\n\n".join(chunk.text for chunk in chunks[:20])

        prompt = f"""
        You are ResearchOS, an AI research assistant.

        Summarize the RESEARCH CONTENT of the paper below.

        Do not ask for more information.
        Do not summarize author biographies, references, affiliations, or metadata.
        Do not say "section notes" or "provided text".

        Return exactly this structure:

        1. Main contribution
        2. Problem addressed
        3. Methods / technical approach
        4. Datasets, tools, or experimental setup
        5. Key findings
        6. Limitations
        7. Future work
        8. Plain-English summary

        If something is not discussed, write "Not discussed".

        Paper text:
        {paper_text}
        """

        summary = self.llm.generate(prompt=prompt)

        await self.paper_repository.update_summary(
            paper=paper,
            summary=summary,
        )

        await self.paper_repository.db.commit()

        return PaperSummaryResponse(
            paper_id=str(paper.id),
            title=paper.title or paper.filename,
            filename=paper.filename,
            summary=summary,
        )