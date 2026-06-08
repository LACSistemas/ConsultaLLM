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
                max_tokens=1024,
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
        prompt = f"""Como CEO, avalie criticamente as perspectivas abaixo para resolver a solicitação do usuário.
Não seja apenas um resumidor: audite a qualidade de cada conselheiro, explicite consensos, divergências, riscos e lacunas de verificação.

HISTÓRICO DA CONVERSA:
{history_text or "Primeira mensagem da conversa."}

SOLICITAÇÃO ATUAL: {user_message}

CONTEXTO DE ANEXOS:
{attachment_context or "Nenhum anexo fornecido."}

PERSPECTIVAS DOS CONSELHEIROS:
Agente A (DeepSeek): {deepseek_response}
Agente B (Gemini): {gemini_response}
Agente C (Anthropic): {anthropic_response}

Retorne exclusivamente um JSON válido, sem markdown, com este formato:
{{
  "decision": "decisão final clara e direta",
  "reasoning": "explicação estratégica da decisão",
  "confidence": 0.0,
  "consensus": ["pontos em que os conselheiros convergem"],
  "disagreements": ["divergências relevantes entre conselheiros"],
  "counselor_assessments": [
    {{
      "provider": "deepseek",
      "strengths": ["forças da resposta"],
      "weaknesses": ["limitações da resposta"],
      "contribution": "como esta resposta influenciou a decisão",
      "confidence": 0.0
    }},
    {{
      "provider": "gemini",
      "strengths": ["forças da resposta"],
      "weaknesses": ["limitações da resposta"],
      "contribution": "como esta resposta influenciou a decisão",
      "confidence": 0.0
    }},
    {{
      "provider": "anthropic",
      "strengths": ["forças da resposta"],
      "weaknesses": ["limitações da resposta"],
      "contribution": "como esta resposta influenciou a decisão",
      "confidence": 0.0
    }}
  ],
  "risks": ["riscos, trade-offs ou premissas frágeis"],
  "verification_needed": ["pontos que precisam de confirmação externa ou dados adicionais"],
  "next_steps": ["próximas ações recomendadas"]
}}

Use valores de confidence entre 0 e 1. Se algum conselheiro estiver indisponível, reduza a confiança e registre isso nas fraquezas, riscos ou verificação necessária."""

        try:
            resp = await self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": CEO_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=2200,
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            raise ProviderError("OpenAI CEO", str(e)) from e
