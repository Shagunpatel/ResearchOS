from typing import List


class ChunkingService:
    """
    Splits extracted PDF pages into overlapping chunks.
    """

    def __init__(
        self,
        chunk_size: int = 800,
        overlap: int = 150,
    ):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_document(self, pages: List[dict]) -> List[dict]:
        chunks = []

        chunk_index = 0

        for page in pages:

            text = page["text"]

            start = 0

            while start < len(text):

                end = start + self.chunk_size

                chunk = text[start:end].strip()

                if chunk:

                    chunks.append(
                        {
                            "chunk_index": chunk_index,
                            "page_number": page["page_number"],
                            "text": chunk,
                            "token_count": len(chunk.split()),
                        }
                    )

                    chunk_index += 1

                start += self.chunk_size - self.overlap

        return chunks