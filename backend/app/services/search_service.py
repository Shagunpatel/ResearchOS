from app.ai.vectorstore.qdrant_service import QdrantService
from app.models.user import User
from app.schemas.search import SemanticSearchResponse, SemanticSearchResult


class SearchService:
    def __init__(self):
        self.qdrant_service = QdrantService()

    def semantic_search(
        self,
        *,
        query: str,
        current_user: User,
        limit: int = 5,
    ) -> SemanticSearchResponse:
        search_results = self.qdrant_service.search(
            query=query,
            user_id=str(current_user.id),
            limit=limit,
        )

        results = []

        for point in search_results.points:
            payload = point.payload or {}

            results.append(
                SemanticSearchResult(
                    score=point.score,
                    paper_id=payload.get("paper_id"),
                    chunk_id=payload.get("chunk_id"),
                    title=payload.get("title"),
                    filename=payload.get("filename"),
                    page_number=payload.get("page_number"),
                    chunk_index=payload.get("chunk_index"),
                    text=payload.get("text"),
                )
            )

        return SemanticSearchResponse(
            query=query,
            results=results,
        )