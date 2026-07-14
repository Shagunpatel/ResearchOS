from pathlib import Path

import fitz  # PyMuPDF
from app.utils.text import clean_text

class PDFService:
    """
    Responsible for extracting text and metadata from PDF files.
    """

    def extract_document(self, pdf_path: str) -> dict:
        pdf_path = Path(pdf_path)

        if not pdf_path.exists():
            raise FileNotFoundError(f"{pdf_path} does not exist.")

        document = fitz.open(pdf_path)

        metadata = document.metadata or {}

        pages = []

        for page_number, page in enumerate(document, start=1):
            text = clean_text(page.get_text("text"))

            pages.append(
                {
                    "page_number": page_number,
                    "text": text,
                }
            )

        document.close()

        return {
            "title": metadata.get("title"),
            "author": metadata.get("author"),
            "subject": metadata.get("subject"),
            "keywords": metadata.get("keywords"),
            "page_count": len(pages),
            "pages": pages,
        }