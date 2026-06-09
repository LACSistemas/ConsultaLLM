import json
import os
import unittest
from unittest.mock import patch

os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("DEEPSEEK_API_KEY", "test-deepseek-key")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")

from app.services.council_service import _parse_ceo_response, run_council


class ParseCEOResponseTests(unittest.TestCase):
    def test_parses_plural_deliberation_json(self):
        payload = {
            "status": "needs_clarification",
            "decision": "Antes de recomendar, esclareça o orçamento.",
            "reasoning": "A melhor opção depende do limite financeiro.",
            "confidence": {
                "level": "low",
                "rationale": "Falta um dado decisivo.",
                "supporting_factors": ["Há consenso sobre o critério"],
                "limiting_factors": ["Orçamento desconhecido"],
            },
            "consensus": ["Começar pequeno"],
            "disagreements": ["Prazo ideal"],
            "minority_views": ["Não executar o projeto"],
            "counselor_assessments": [
                {
                    "provider": "A",
                    "role": "skeptic",
                    "strengths": ["Questionou a premissa"],
                    "weaknesses": ["Não estimou impacto"],
                    "contribution": "Revelou a lacuna financeira.",
                    "reliability": "high",
                }
            ],
            "known_facts": ["O projeto ainda não começou"],
            "assumptions": ["Existe equipe disponível"],
            "inferences": ["Um piloto reduziria exposição"],
            "value_judgments": ["Reversibilidade é prioritária"],
            "unknowns": ["Orçamento"],
            "risks": ["Custo maior que o benefício"],
            "verification_needed": ["Validar custos"],
            "clarifying_questions": ["Qual é o orçamento máximo?"],
            "next_steps": ["Responder às perguntas"],
        }

        result = _parse_ceo_response(json.dumps(payload))

        self.assertEqual(result.status, "needs_clarification")
        self.assertEqual(result.confidence.level, "low")
        self.assertEqual(result.minority_views, ["Não executar o projeto"])
        self.assertEqual(result.clarifying_questions, ["Qual é o orçamento máximo?"])

    def test_migrates_legacy_numeric_confidence(self):
        text = json.dumps(
            {
                "decision": "Seguir",
                "reasoning": "Há consenso",
                "confidence": 0.82,
                "counselor_assessments": [
                    {
                        "provider": "deepseek",
                        "strengths": [],
                        "weaknesses": [],
                        "contribution": "Análise",
                        "confidence": 0.8,
                    }
                ],
            }
        )

        result = _parse_ceo_response(text)

        self.assertEqual(result.confidence.level, "high")
        self.assertEqual(result.counselor_assessments[0].reliability, "high")
        self.assertTrue(result.confidence.limiting_factors)

    def test_extracts_json_wrapped_in_markdown(self):
        text = '```json\n{"decision":"Seguir","reasoning":"Há consenso"}\n```'

        result = _parse_ceo_response(text)

        self.assertEqual(result.decision, "Seguir")
        self.assertEqual(result.confidence.level, "medium")

    def test_falls_back_for_legacy_text(self):
        text = "DECISÃO: Fazer um piloto.\nRACIOCÍNIO: Reduz o risco inicial."

        result = _parse_ceo_response(text)

        self.assertEqual(result.decision, "Fazer um piloto.")
        self.assertEqual(result.reasoning, "Reduz o risco inicial.")
        self.assertEqual(result.confidence.level, "low")
        self.assertTrue(result.verification_needed)


class _FakeCounselorProvider:
    def __init__(self, name):
        self.name = name
        self.system_prompts = []

    async def complete(self, system, messages):
        self.system_prompts.append(system)
        if "segunda rodada" in messages[-1]["content"]:
            return f"Crítica de {self.name}: falta validar a premissa central."
        return f"Análise inicial de {self.name}."


class _FakeFacilitator:
    def __init__(self):
        self.perspectives = []

    async def complete_as_facilitator(self, **kwargs):
        self.perspectives = kwargs["perspectives"]
        return json.dumps(
            {
                "status": "needs_clarification",
                "decision": "A orientação depende de uma resposta adicional.",
                "reasoning": "As perspectivas identificaram uma lacuna comum.",
                "confidence": {
                    "level": "low",
                    "rationale": "Falta contexto.",
                    "supporting_factors": [],
                    "limiting_factors": ["Informação essencial ausente"],
                },
                "counselor_assessments": [
                    {
                        "provider": item["alias"],
                        "role": "",
                        "strengths": [],
                        "weaknesses": [],
                        "contribution": "Participou da deliberação.",
                        "reliability": "medium",
                    }
                    for item in kwargs["perspectives"]
                ],
                "clarifying_questions": ["Qual resultado você prioriza?"],
            }
        )


class CouncilProtocolTests(unittest.IsolatedAsyncioTestCase):
    async def test_runs_epistemic_roles_and_second_round_then_deanonymizes_assessments(self):
        deepseek = _FakeCounselorProvider("DeepSeek")
        gemini = _FakeCounselorProvider("Gemini")
        anthropic = _FakeCounselorProvider("Anthropic")
        facilitator = _FakeFacilitator()

        with (
            patch("app.services.council_service._deepseek", deepseek),
            patch("app.services.council_service._gemini", gemini),
            patch("app.services.council_service._anthropic", anthropic),
            patch("app.services.council_service._openai", facilitator),
            patch("app.services.council_service.random.SystemRandom.shuffle", lambda self, items: None),
        ):
            result = await run_council("Devo executar?", [], [])

        self.assertEqual([c.role for c in result.counselors], ["proponent", "skeptic", "alternative"])
        self.assertTrue(all(c.critique.startswith("Crítica") for c in result.counselors))
        self.assertEqual(result.ceo_decision.status, "needs_clarification")
        self.assertEqual(
            {item.provider for item in result.ceo_decision.counselor_assessments},
            {"deepseek", "gemini", "anthropic"},
        )
        self.assertTrue(all("função epistemológica" in prompt for prompt in deepseek.system_prompts))
        self.assertEqual({item["alias"] for item in facilitator.perspectives}, {"A", "B", "C"})


if __name__ == "__main__":
    unittest.main()
