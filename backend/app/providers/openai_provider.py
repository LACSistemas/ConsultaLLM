from openai import AsyncOpenAI

from app.core.config import settings
from app.core.errors import ProviderError
from app.providers.base import LLMProvider

CEO_SYSTEM_PROMPT = (
    "Você é um CEO experiente que toma decisões estratégicas baseadas na análise de múltiplas "
    "perspectivas. Seja direto, assertivo e forneça uma decisão clara e bem fundamentada."
)


class OpenAIProvider(LLMProvider):
    def __init__(self):
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def complete(self, system: str, messages: list[dict]) -> str:
        try:
            resp = await self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": system}, *messages],
                max_tokens=300,
                temperature=0.7,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            raise ProviderError("OpenAI", str(e)) from e

    async def complete_as_ceo(
        self,
        user_message: str,
        history_text: str,
        deepseek_response: str,
        gemini_response: str,
        anthropic_response: str,
        attachment_context: str,
    ) -> str:
        prompt = f"""Como CEO, analise as seguintes perspectivas para resolver a solicitação do usuário.

HISTÓRICO DA CONVERSA:
{history_text or "Primeira mensagem da conversa."}

SOLICITAÇÃO ATUAL: {user_message}

CONTEXTO DE ANEXOS:
{attachment_context or "Nenhum anexo fornecido."}

PERSPECTIVAS DOS CONSELHEIROS:
Agente A (DeepSeek): {deepseek_response}
Agente B (Gemini): {gemini_response}
Agente C (Anthropic): {anthropic_response}

Forneça uma decisão final consolidada considerando o melhor de cada perspectiva.
Formato obrigatório:
DECISÃO: [sua decisão final clara e direta]
RACIOCÍNIO: [explicação estratégica de por que essa é a melhor decisão]"""

        try:
            resp = await self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": CEO_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=400,
                temperature=0.5,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            raise ProviderError("OpenAI CEO", str(e)) from e
