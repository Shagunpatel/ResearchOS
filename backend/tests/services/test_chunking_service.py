from pathlib import Path

from app.services.chunking_service import ChunkingService
from app.services.pdf_service import PDFService


def test_chunk_document():
    uploads = Path("storage/uploads")
    pdf_files = list(uploads.glob("*.pdf"))

    assert len(pdf_files) > 0

    pdf_service = PDFService()
    document = pdf_service.extract_document(str(pdf_files[0]))

    chunker = ChunkingService()

    chunks = chunker.chunk_document(document["pages"])

    assert len(chunks) > 0

    first_chunk = chunks[0]

    assert "page_number" in first_chunk
    assert "text" in first_chunk
    assert "chunk_index" in first_chunk