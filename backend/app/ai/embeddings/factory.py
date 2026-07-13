from app.ai.embeddings.base import EmbeddingProvider
from app.ai.embeddings.sentence_transformer_provider import (
    get_sentence_transformer_provider,
)


def get_embedding_provider() -> EmbeddingProvider:
    return get_sentence_transformer_provider()