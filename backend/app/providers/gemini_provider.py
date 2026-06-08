from google import genai
from google.genai import types

from app.core.config import settings
from app.core.errors import ProviderError
from app.providers.base import LLMProvider

SYSTEM_PROMPT = (
    "Você é um conselheiro criativo e inovador. Explore perspectivas não convencionais e conexões "
    "inesperadas. Seja inspirador e prático, mas conciso."
)


class GeminiProvider(LLMProvider):
    def __init__(self):
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def complete(self, system: str, messages: list[dict]) -> str:
        try:
            contents = []
            for m in messages[:-1]:
                role = "user" if m["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": m["content"]}]})

            if messages:
                contents.append({"role": "user", "parts": [{"text": messages[-1]["content"]}]})

            response = await self._client.aio.models.generate_content(
                model="gemini-3.1-flash-lite",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    max_output_tokens=1024,
                ),
            )
            return response.text or ""
        except Exception as e:
            raise ProviderError("Gemini", str(e)) from e
