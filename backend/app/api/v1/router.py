from fastapi import APIRouter

from app.api.v1 import auth, chat, experiments, papers, research, search

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(papers.router)
api_router.include_router(search.router)
api_router.include_router(chat.router)
api_router.include_router(research.router)
api_router.include_router(experiments.router)