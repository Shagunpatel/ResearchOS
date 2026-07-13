from app.ai.llm.factory import get_llm_provider
from app.services.search_service import SearchService
from app.models.user import User


class RAGService:
    def __init__(self):
        self.search_service = SearchService()
        self.llm = get_llm_provider()

    def answer_question(
        self,
        *,
        query: str,
        current_user: User,
    ):
        search = self.search_service.semantic_search(
            query=query,
            current_user=current_user,
            limit=5,
        )

        context = ""

        for result in search.results:
            context += (
                f"[Paper: {result.filename}, Page: {result.page_number}]\n"
                f"{result.text}\n\n"
            )

        prompt = f"""
You are ResearchOS, an AI research assistant.

Answer ONLY using the context below.

If the answer cannot be found, say:
"I could not find the answer in the uploaded papers."

Context:

{context}

Question:

{query}

Provide citations like:
(PaperName.pdf, page X)
"""

        answer = self.llm.generate(prompt=prompt)

        return {
            "answer": answer,
            "sources": search.results,
        }