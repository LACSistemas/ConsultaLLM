import asyncio
import re
import logging

from app.providers.deepseek_provider import DeepSeekProvider, SYSTEM_PROMPT as DS_SYSTEM
from app.providers.gemini_provider import GeminiProvider, SYSTEM_PROMPT as GEM_SYSTEM
from app.providers.anthropic_provider import AnthropicProvider, SYSTEM_PROMPT as ANT_SYSTEM
from app.providers.openai_provider import OpenAIProvider
from app.schemas.message import CounselorResponse, CEODecision
from app.services.prompt_service import format_history_as_text, format_attachment_context, truncate_history

logger = logging.getLogger("conselho_ia")

_deepseek = DeepSeekProvider()
_gemini = GeminiProvider()
_anthropic = AnthropicProvider()
_openai = OpenAIProvider()


class CouncilResult:
    def __init__(self, counselors: list[CounselorResponse], ceo_decision: CEODecision):
        self.counselors = counselors
        self.ceo_decision = ceo_decision


def _parse_ceo_response(text: str) -> CEODecision:
    decision_match = re.search(r"DECISÃO:\s*(.+?)(?=RACIOCÍNIO:|$)", text, re.DOTALL)
    reasoning_match = re.search(r"RACIOCÍNIO:\s*(.+)", text, re.DOTALL)
    return CEODecision(
        decision=decision_match.group(1).strip() if decision_match else text.strip(),
        reasoning=reasoning_match.group(1).strip() if reasoning_match else "Análise baseada nas múltiplas perspectivas fornecidas.",
    )


def _safe_response(result, provider_name: str) -> str:
    if isinstance(result, Exception):
        logger.warning("Provider %s failed: %s", provider_name, result)
        return f"[{provider_name} indisponível no momento]"
    return result or f"[{provider_name} não retornou resposta]"


async def run_council(
    user_message: str,
    chat_history: list[dict],
    attachment_texts: list[str],
) -> CouncilResult:
    history = truncate_history(chat_history, max_msgs=20)
    attachment_context = format_attachment_context(attachment_texts)

    if attachment_context:
        user_content = f"{user_message}\n\nCONTEÚDO DO ANEXO:\n{attachment_context}"
    else:
        user_content = user_message

    messages_for_counselors = [*history, {"role": "user", "content": user_content}]

    deepseek_task = _deepseek.complete(DS_SYSTEM, messages_for_counselors)
    gemini_task = _gemini.complete(GEM_SYSTEM, messages_for_counselors)
    anthropic_task = _anthropic.complete(ANT_SYSTEM, messages_for_counselors)

    results = await asyncio.gather(deepseek_task, gemini_task, anthropic_task, return_exceptions=True)

    ds_text = _safe_response(results[0], "DeepSeek")
    gem_text = _safe_response(results[1], "Gemini")
    ant_text = _safe_response(results[2], "Anthropic")

    counselors = [
        CounselorResponse(name="Agente A — DeepSeek", provider="deepseek", response=ds_text),
        CounselorResponse(name="Agente B — Gemini", provider="gemini", response=gem_text),
        CounselorResponse(name="Agente C — Anthropic", provider="anthropic", response=ant_text),
    ]

    history_text = format_history_as_text(history)

    ceo_text = await _openai.complete_as_ceo(
        user_message=user_message,
        history_text=history_text,
        deepseek_response=ds_text,
        gemini_response=gem_text,
        anthropic_response=ant_text,
        attachment_context=attachment_context,
    )

    ceo_decision = _parse_ceo_response(ceo_text)

    return CouncilResult(counselors=counselors, ceo_decision=ceo_decision)
