# file_processor.py
"""
Tammy — Per-type file processing.

For images: passthrough (raw bytes → LLM vision).
For documents/code/spreadsheets: text extraction → string injected into context.
For audio: Whisper transcription → string.
"""

import io
from typing import Optional
from backend.logger import get_logger

logger = get_logger(__name__)

# Types the LLM sees natively as images (vision content blocks)
IMAGE_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/gif",
    "image/webp", "image/heic", "image/heif",
}

# Types that need text extraction before being sent to LLM
TEXT_EXTRACTABLE = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    # Code files (served as text/*)
    "text/x-python", "text/javascript", "text/typescript",
    "application/json", "text/html", "text/css",
    "application/x-yaml", "text/x-yaml",
    "application/x-sql", "text/x-sql",
}

AUDIO_TYPES = {
    "audio/mpeg", "audio/mp4", "audio/wav",
    "audio/ogg", "audio/webm", "audio/m4a",
    "audio/x-m4a",
}

MAX_TEXT_CHARS = 12_000  # ~3000 tokens — cap extracted text per file


class ProcessedFile:
    """Result of processing a single uploaded file."""
    def __init__(
        self,
        filename: str,
        content_type: str,
        *,
        # For images:
        image_bytes: bytes = None,
        # For text-extractable files:
        extracted_text: str = None,
        error: str = None,
    ):
        self.filename = filename
        self.content_type = content_type
        self.image_bytes = image_bytes
        self.extracted_text = extracted_text
        self.error = error

    @property
    def is_image(self):
        return self.image_bytes is not None

    @property
    def is_text(self):
        return self.extracted_text is not None


def process(data: bytes, content_type: str, filename: str = "file") -> ProcessedFile:
    """
    Route file to the correct processor.
    Returns a ProcessedFile with either image_bytes or extracted_text set.
    """
    ct = content_type.lower().split(";")[0].strip()

    if ct in IMAGE_TYPES:
        return ProcessedFile(filename, ct, image_bytes=data)

    if ct in AUDIO_TYPES:
        return _process_audio(data, ct, filename)

    if ct == "application/pdf":
        return _process_pdf(data, filename)

    if ct in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ):
        return _process_docx(data, filename)

    if ct in (
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ):
        return _process_spreadsheet(data, ct, filename)

    # All remaining: try to decode as UTF-8 text (code files, txt, md, json, yaml...)
    return _process_text(data, filename)


# ── Processors ────────────────────────────────────────────────────────────────

def _process_pdf(data: bytes, filename: str) -> ProcessedFile:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(data))
        pages = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        text = "\n\n".join(pages)[:MAX_TEXT_CHARS]
        return ProcessedFile(filename, "application/pdf", extracted_text=text)
    except ImportError:
        return ProcessedFile(filename, "application/pdf",
                             error="PDF extraction requires: pip install pypdf")
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ProcessedFile(filename, "application/pdf", error=str(e))


def _process_docx(data: bytes, filename: str) -> ProcessedFile:
    try:
        from docx import Document
        doc = Document(io.BytesIO(data))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n\n".join(paragraphs)[:MAX_TEXT_CHARS]
        return ProcessedFile(filename, "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                             extracted_text=text)
    except ImportError:
        return ProcessedFile(filename, "application/msword",
                             error="DOCX extraction requires: pip install python-docx")
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        return ProcessedFile(filename, "application/msword", error=str(e))


def _process_spreadsheet(data: bytes, content_type: str, filename: str) -> ProcessedFile:
    try:
        import pandas as pd
        if content_type == "text/csv":
            df = pd.read_csv(io.BytesIO(data), nrows=200)
        else:
            df = pd.read_excel(io.BytesIO(data), nrows=200)
        text = df.to_markdown(index=False)[:MAX_TEXT_CHARS]
        return ProcessedFile(filename, content_type, extracted_text=text)
    except ImportError:
        # Fallback: just decode as text for CSV
        if content_type == "text/csv":
            return _process_text(data, filename)
        return ProcessedFile(filename, content_type,
                             error="Spreadsheet extraction requires: pip install pandas openpyxl tabulate")
    except Exception as e:
        logger.error(f"Spreadsheet extraction failed: {e}")
        return ProcessedFile(filename, content_type, error=str(e))


def _process_text(data: bytes, filename: str) -> ProcessedFile:
    try:
        text = data.decode("utf-8", errors="replace")[:MAX_TEXT_CHARS]
        return ProcessedFile(filename, "text/plain", extracted_text=text)
    except Exception as e:
        return ProcessedFile(filename, "text/plain", error=str(e))


def _process_audio(data: bytes, content_type: str, filename: str) -> ProcessedFile:
    try:
        from openai import OpenAI
        from backend.config import config
        client = OpenAI(api_key=config.OPENAI_API_KEY)
        # Whisper needs a file-like object with a name
        buf = io.BytesIO(data)
        buf.name = filename
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=buf,
            response_format="text",
        )
        transcript = f"[Audio transcript of {filename}]:\n{result}"[:MAX_TEXT_CHARS]
        return ProcessedFile(filename, content_type, extracted_text=transcript)
    except Exception as e:
        logger.error(f"Audio transcription failed: {e}")
        return ProcessedFile(filename, content_type, error=str(e))


__all__ = ["process", "ProcessedFile", "IMAGE_TYPES", "TEXT_EXTRACTABLE", "AUDIO_TYPES"]
