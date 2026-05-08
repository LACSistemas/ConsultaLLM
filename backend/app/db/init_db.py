import os
from app.db.database import engine, Base
from app.core.config import settings
import app.db.models  # noqa: F401 — registers all models with Base


async def init_db() -> None:
    os.makedirs(settings.upload_dir, exist_ok=True)
    db_path = settings.database_url.replace("sqlite+aiosqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
