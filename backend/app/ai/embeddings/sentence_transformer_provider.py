from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.ai.embeddings.base import EmbeddingProvider


class SentenceTransformerProvider(EmbeddingProvider):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)

    def embed_text(self, text: str) -> list[float]:
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        return embeddings.tolist()

    def dimension(self) -> int:
        return self.model.get_sentence_embedding_dimension()


@lru_cache
def get_sentence_transformer_provider() -> SentenceTransformerProvider:
    return SentenceTransformerProvider()