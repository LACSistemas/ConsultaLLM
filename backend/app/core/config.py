import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./storage/council.db")
    upload_dir: str = os.getenv("UPLOAD_DIR", "./storage/uploads")


settings = Settings()
