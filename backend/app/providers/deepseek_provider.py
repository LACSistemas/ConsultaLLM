from openai import AsyncOpenAI

from app.core.config import settings
from app.core.errors import ProviderError
from app.providers.base import LLMProvider

SYSTEM_PROMPT = (
    "Você é um conselheiro especialista que analisa problemas com profundidade técnica e lógica "
    "estruturada. Seja direto, fundamentado e conciso."
)


class DeepSeekProvider(LLMProvider):
    def __init__(self):
        self._client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url="https://api.deepseek.com/v1",
        )

    async def complete(self, system: str, messages: list[dict]) -> str:
        try:
            resp = await self._client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "system", "content": system}, *messages],
                max_tokens=300,
                temperature=0.7,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            raise ProviderError("DeepSeek", str(e)) from e
