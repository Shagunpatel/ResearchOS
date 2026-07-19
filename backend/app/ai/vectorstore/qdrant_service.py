from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PointStruct,
    VectorParams,
)

from app.ai.embeddings.factory import get_embedding_provider

COLLECTION_NAME = "researchos_chunks"


class QdrantService:
    def __init__(self):
        self.client = QdrantClient(url="http://localhost:6333")
        self.embedding_provider = get_embedding_provider()

    def collection_exists(self) -> bool:
        collections = self.client.get_collections().collections

        return any(
            collection.name == COLLECTION_NAME
            for collection in collections
        )

    def ensure_collection(self) -> None:
        if self.collection_exists():
            return

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

        if not chunks:
            return

        texts = [chunk["text"] for chunk in chunks]
        vectors = self.embedding_provider.embed_texts(texts)

        points = [
            PointStruct(
                id=chunk["point_id"],
                vector=vector,
                payload=chunk["payload"],
            )
            for chunk, vector in zip(chunks, vectors)
        ]

        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=points,
            wait=True,
        )

    def delete_paper_chunks(
        self,
        *,
        paper_id: str,
        user_id: str,
    ) -> None:
        if not self.collection_exists():
            return

        self.client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=FilterSelector(
                filter=Filter(
                    must=[
                        FieldCondition(
                            key="paper_id",
                            match=MatchValue(value=paper_id),
                        ),
                        FieldCondition(
                            key="user_id",
                            match=MatchValue(value=user_id),
                        ),
                    ]
                )
            ),
            wait=True,
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