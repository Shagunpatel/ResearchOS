from functools import lru_cache

from app.ai.llm.base import LLMProvider
from app.ai.llm.ollama_provider import OllamaProvider


@lru_cache
def get_llm_provider() -> LLMProvider:
    return OllamaProvider()