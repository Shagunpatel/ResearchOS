from fastapi import APIRouter, Depends

from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/query", response_model=ChatResponse)
def chat_query(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    rag = RAGService()

    response = rag.answer_question(
        query=payload.question,
        current_user=current_user,
    )

    return ChatResponse(
        answer=response["answer"],
        sources=response["sources"],
    )