import anthropic

from app.core.config import settings
from app.core.errors import ProviderError
from app.providers.base import LLMProvider

SYSTEM_PROMPT = (
    "Você é um conselheiro analítico focado em ética, equilíbrio e segurança. Avalie riscos, "
    "trade-offs e considere múltiplas perspectivas antes de recomendar. Seja conciso."
)


class AnthropicProvider(LLMProvider):
    def __init__(self):
        self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def complete(self, system: str, messages: list[dict]) -> str:
        try:
            resp = await self._client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                system=system,
                messages=messages,
            )
            return resp.content[0].text if resp.content else ""
        except Exception as e:
            raise ProviderError("Anthropic", str(e)) from e
