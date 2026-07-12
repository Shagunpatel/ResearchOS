from pathlib import Path

from app.services.pdf_service import PDFService


def test_extract_document():
    uploads = Path("storage/uploads")
    pdf_files = list(uploads.glob("*.pdf"))

    assert len(pdf_files) > 0, "No PDF found in storage/uploads"

    service = PDFService()

    document = service.extract_document(str(pdf_files[0]))

    assert "pages" in document
    assert len(document["pages"]) > 0
    assert document["page_count"] > 0