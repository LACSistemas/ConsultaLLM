from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["settings"])


@router.get("/settings")
async def get_settings():
    return {
        "providers": {
            "openai": bool(settings.openai_api_key),
            "deepseek": bool(settings.deepseek_api_key),
            "gemini": bool(settings.gemini_api_key),
            "anthropic": bool(settings.anthropic_api_key),
        }
    }
