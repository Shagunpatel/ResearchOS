from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.ai.embeddings.factory import get_embedding_provider

COLLECTION_NAME = "researchos_chunks"


class QdrantService:
    def __init__(self):
        self.client = QdrantClient(url="http://localhost:6333")
        self.embedding_provider = get_embedding_provider()

    def ensure_collection(self) -> None:
        collections = self.client.get_collections().collections
        collection_names = [collection.name for collection in collections]

        if COLLECTION_NAME not in collection_names:
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=self.embedding_provider.dimension(),
                    distance=Distance.COSINE,
                ),
            )

    def upsert_chunk(
        self,
        *,
        point_id: str,
        text: str,
        payload: dict,
    ) -> None:
        self.ensure_collection()

        vector = self.embedding_provider.embed_text(text)

        point = PointStruct(
            id=point_id,
            vector=vector,
            payload=payload,
        )

        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=[point],
        )

    def upsert_chunks(
        self,
        *,
        chunks: list[dict],
    ) -> None:
        self.ensure_collection()

        texts = [chunk["text"] for chunk in chunks]
        vectors = self.embedding_provider.embed_texts(texts)

        points = []

        for chunk, vector in zip(chunks, vectors):
            points.append(
                PointStruct(
                    id=chunk["point_id"],
                    vector=vector,
                    payload=chunk["payload"],
                )
            )

        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=points,
        )

    def search(
        self,
        *,
        query: str,
        user_id: str,
        limit: int = 5,
    ):
        self.ensure_collection()

        query_vector = self.embedding_provider.embed_text(query)

        return self.client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter={
                "must": [
                    {
                        "key": "user_id",
                        "match": {
                            "value": user_id,
                        },
                    }
                ]
            },
            limit=limit,
        )