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
                    "received",
                    "accepted",
                    "corresponding author",
                ]
            )
        ]

        section_summaries = []

        for i in range(0, min(len(filtered_chunks), 40), 5):
            chunk_group = filtered_chunks[i : i + 5]
            group_text = "\n\n".join(chunk.text for chunk in chunk_group)

            section_prompt = f"""
        Summarize the research content below in 5 bullet points.
        Ignore author names, references, metadata, and biographies.

        Text:
        {group_text}
        """

            section_summaries.append(self.llm.generate(prompt=section_prompt))

        combined_summary_notes = "\n\n".join(section_summaries)

        final_prompt = f"""
        You are ResearchOS, an AI research assistant.

        Using the section notes below, write a coherent summary of the whole paper.

        Return exactly this structure:

        1. Main contribution
        2. Problem addressed
        3. Methods / technical approach
        4. Datasets, tools, or experimental setup
        5. Key findings
        6. Limitations
        7. Future work
        8. Plain-English summary

        If a section is not explicitly discussed, write

        "Not discussed in this paper."

        instead of making assumptions.

        Section notes:
        {combined_summary_notes}
        """

        summary = self.llm.generate(prompt=final_prompt)

        return PaperSummaryResponse(
            paper_id=str(paper.id),
            title=paper.title or paper.filename,
            filename=paper.filename,
            summary=summary,
        )