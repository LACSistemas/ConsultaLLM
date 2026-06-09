import asyncio
import json
import logging
import random
import re
from dataclasses import dataclass

from pydantic import ValidationError

from app.core.errors import ProviderError
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.deepseek_provider import DeepSeekProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.openai_provider import OpenAIProvider
from app.schemas.message import CEODecision, ConfidenceAssessment, CounselorResponse
from app.services.prompt_service import (
    format_attachment_context,
    format_history_as_text,
    truncate_history,
)

logger = logging.getLogger("conselho_ia")

_deepseek = DeepSeekProvider()
_gemini = GeminiProvider()
_anthropic = AnthropicProvider()
_openai = OpenAIProvider()


@dataclass(frozen=True)
class EpistemicRole:
    key: str
    name: str
    description: str
    instruction: str


ROLES = (
    EpistemicRole(
        key="proponent",
        name="Proponente pragmático",
        description="Constrói a opção mais útil e executável sem esconder suas premissas.",
        instruction=(
            "Construa a melhor resposta ou plano executável para o objetivo do usuário. Explicite "
            "premissas, fatos usados, inferências e critérios de sucesso. Se faltarem dados essenciais, "
            "faça perguntas objetivas em vez de preencher lacunas silenciosamente."
        ),
    ),
    EpistemicRole(
        key="skeptic",
        name="Cético construtivo",
        description="Testa premissas, procura falhas e protege contra consenso prematuro.",
        instruction=(
            "Tente refutar as premissas mais importantes e identifique como a recomendação poderia "
            "falhar. Procure evidências ausentes, riscos, incentivos e efeitos de segunda ordem. "
            "Ofereça correções práticas e perguntas que mudariam materialmente a conclusão."
        ),
    ),
    EpistemicRole(
        key="alternative",
        name="Explorador de alternativas",
        description="Busca enquadramentos, valores e opções que o caminho óbvio deixa de fora.",
        instruction=(
            "Questione o enquadramento inicial e proponha alternativas genuinamente diferentes, "
            "inclusive não agir, testar em pequena escala ou mudar o objetivo. Considere pessoas "
            "afetadas e juízos de valor. Sinalize o que ainda precisa ser esclarecido."
        ),
    ),
)


class CouncilResult:
    def __init__(self, counselors: list[CounselorResponse], ceo_decision: CEODecision):
        self.counselors = counselors
        self.ceo_decision = ceo_decision


def _extract_json_object(text: str) -> dict | None:
    try:
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


def _normalize_legacy_payload(payload: dict) -> dict:
    normalized = dict(payload)
    confidence = normalized.get("confidence")
    if isinstance(confidence, (int, float)):
        if confidence >= 0.75:
            level = "high"
        elif confidence < 0.45:
            level = "low"
        else:
            level = "medium"
        normalized["confidence"] = {
            "level": level,
            "rationale": "Classificação aproximada migrada de uma resposta legada.",
            "supporting_factors": [],
            "limiting_factors": ["A resposta original usava autoconfiança numérica não calibrada."],
        }

    assessments = normalized.get("counselor_assessments", [])
    if isinstance(assessments, list):
        for assessment in assessments:
            if not isinstance(assessment, dict) or "reliability" in assessment:
                continue
            old_confidence = assessment.pop("confidence", 0.5)
            assessment["reliability"] = (
                "high" if old_confidence >= 0.75 else "low" if old_confidence < 0.45 else "medium"
            )
    return normalized


def _fallback_facilitator_response(text: str, counselors: list[CounselorResponse]) -> CEODecision:
    decision_match = re.search(r"DECISÃO:\s*(.+?)(?=RACIOCÍNIO:|$)", text, re.DOTALL)
    reasoning_match = re.search(r"RACIOCÍNIO:\s*(.+)", text, re.DOTALL)
    decision = decision_match.group(1).strip() if decision_match else text.strip()
    reasoning = (
        reasoning_match.group(1).strip()
        if reasoning_match
        else "Síntese provisória baseada nas perspectivas disponíveis."
    )
    unavailable = [c.name for c in counselors if "indisponível" in c.response.lower()]
    return CEODecision(
        decision=decision or "Não foi possível produzir uma síntese estruturada.",
        reasoning=reasoning,
        confidence=ConfidenceAssessment(
            level="low",
            rationale="A síntese não veio no formato deliberativo esperado.",
            limiting_factors=[
                "A estrutura de fatos, premissas e divergências precisa de revisão manual.",
                *([f"Perspectivas indisponíveis: {', '.join(unavailable)}"] if unavailable else []),
            ],
        ),
        risks=["A resposta do facilitador não passou pela validação do protocolo."],
        verification_needed=["Revise manualmente as perspectivas antes de agir."],
    )


def _parse_ceo_response(text: str, counselors: list[CounselorResponse] | None = None) -> CEODecision:
    counselors = counselors or []
    parsed = _extract_json_object(text)
    if parsed is None:
        return _fallback_facilitator_response(text, counselors)

    try:
        return CEODecision.model_validate(_normalize_legacy_payload(parsed))
    except ValidationError as exc:
        logger.warning("Facilitator response failed deliberation schema validation: %s", exc)
        return _fallback_facilitator_response(text, counselors)


def _safe_response(result: object, provider_name: str) -> str:
    if isinstance(result, Exception):
        logger.warning("Provider %s failed: %s", provider_name, result)
        return f"[{provider_name} indisponível no momento]"
    return str(result) if result else f"[{provider_name} não retornou resposta]"


def _role_system_prompt(role: EpistemicRole) -> str:
    return (
        f"Você ocupa a função epistemológica de {role.name}. {role.instruction}\n\n"
        "Responda em português claro. Não finja certeza. Separe explicitamente, quando aplicável: "
        "fatos fornecidos, premissas, inferências, valores, desconhecidos e perguntas de esclarecimento. "
        "Seja substantivo, mas evite repetição."
    )


def _critique_prompt(role: EpistemicRole, user_message: str, anonymous_responses: str) -> str:
    return f"""Você está na segunda rodada de uma deliberação e continua exercendo a função de {role.name}.
Compare as perspectivas anônimas abaixo. Identifique o desacordo mais importante, uma premissa frágil,
um ponto forte de outra perspectiva e como sua análise inicial deveria ser corrigida ou ampliada.
Não tente produzir consenso artificial. Preserve alternativas relevantes e liste perguntas essenciais ainda abertas.

SOLICITAÇÃO ORIGINAL:
{user_message}

{anonymous_responses}
"""


async def run_council(
    user_message: str,
    chat_history: list[dict],
    attachment_texts: list[str],
) -> CouncilResult:
    history = truncate_history(chat_history, max_msgs=20)
    attachment_context = format_attachment_context(attachment_texts)
    user_content = user_message
    if attachment_context:
        user_content += f"\n\nCONTEXTO DE ANEXOS NÃO CONFIÁVEIS:\n{attachment_context}"
    messages = [*history, {"role": "user", "content": user_content}]

    providers = [
        ("deepseek", "DeepSeek", _deepseek),
        ("gemini", "Gemini", _gemini),
        ("anthropic", "Anthropic", _anthropic),
    ]
    roles = list(ROLES)
    random.SystemRandom().shuffle(roles)
    assignments = [(*provider, role) for provider, role in zip(providers, roles)]

    first_round_tasks = [
        provider.complete(_role_system_prompt(role), messages)
        for _, _, provider, role in assignments
    ]
    first_round_results = await asyncio.gather(*first_round_tasks, return_exceptions=True)
    first_responses = [
        _safe_response(result, display_name)
        for result, (_, display_name, _, _) in zip(first_round_results, assignments)
    ]

    aliases = ["A", "B", "C"]
    perspective_order = list(range(len(first_responses)))
    random.SystemRandom().shuffle(perspective_order)
    alias_by_index = {
        counselor_index: aliases[position]
        for position, counselor_index in enumerate(perspective_order)
    }
    anonymous_responses = "\n\n".join(
        f"PERSPECTIVA {aliases[position]}:\n{first_responses[counselor_index]}"
        for position, counselor_index in enumerate(perspective_order)
    )
    critique_tasks = [
        provider.complete(
            _role_system_prompt(role),
            [{"role": "user", "content": _critique_prompt(role, user_message, anonymous_responses)}],
        )
        for _, _, provider, role in assignments
    ]
    critique_results = await asyncio.gather(*critique_tasks, return_exceptions=True)
    critiques = [
        _safe_response(result, display_name)
        for result, (_, display_name, _, _) in zip(critique_results, assignments)
    ]

    counselors = [
        CounselorResponse(
            name=role.name,
            provider=provider_key,
            role=role.key,
            role_description=role.description,
            response=response,
            critique=critique,
        )
        for (provider_key, _, _, role), response, critique in zip(
            assignments, first_responses, critiques
        )
    ]

    perspectives = [
        {
            "alias": alias_by_index[index],
            "role": counselors[index].name,
            "response": counselors[index].response,
            "critique": counselors[index].critique,
            "counselor_index": index,
        }
        for index in perspective_order
    ]

    try:
        facilitator_text = await _openai.complete_as_facilitator(
            user_message=user_message,
            history_text=format_history_as_text(history),
            perspectives=perspectives,
            attachment_context=attachment_context,
        )
        decision = _parse_ceo_response(facilitator_text, counselors)
    except ProviderError as exc:
        logger.warning("Facilitator failed after council completed: %s", exc)
        decision = _fallback_facilitator_response("", counselors)
        decision.decision = "As perspectivas foram preservadas, mas a síntese está temporariamente indisponível."

    alias_to_counselor = {
        item["alias"]: counselors[item["counselor_index"]] for item in perspectives
    }
    for assessment in decision.counselor_assessments:
        counselor = alias_to_counselor.get(assessment.provider)
        if counselor:
            assessment.provider = counselor.provider
            assessment.role = counselor.role

    return CouncilResult(counselors=counselors, ceo_decision=decision)
