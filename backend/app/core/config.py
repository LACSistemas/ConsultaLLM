import os
from dotenv import load_dotenv

load_dotenv()


def _positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer") from exc
    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")
    return value


class Settings:
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./storage/council.db")
    upload_dir: str = os.getenv("UPLOAD_DIR", "./storage/uploads")
    max_upload_bytes: int = _positive_int("MAX_UPLOAD_BYTES", 10 * 1024 * 1024)
    max_attachment_chars: int = _positive_int("MAX_ATTACHMENT_CHARS", 100_000)
    max_pdf_pages: int = _positive_int("MAX_PDF_PAGES", 100)
    max_xlsx_rows: int = _positive_int("MAX_XLSX_ROWS", 10_000)
    max_xlsx_uncompressed_bytes: int = _positive_int(
        "MAX_XLSX_UNCOMPRESSED_BYTES", 50 * 1024 * 1024
    )
    max_attachments_per_message: int = _positive_int("MAX_ATTACHMENTS_PER_MESSAGE", 5)


settings = Settings()
