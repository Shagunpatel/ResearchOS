from fastapi import APIRouter, Depends

from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.search import SemanticSearchRequest, SemanticSearchResponse
from app.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("/semantic", response_model=SemanticSearchResponse)
def semantic_search(
    payload: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
):
    service = SearchService()

    return service.semantic_search(
        query=payload.query,
        current_user=current_user,
        limit=payload.limit,
    )