import json
import os
import unittest

os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("DEEPSEEK_API_KEY", "test-deepseek-key")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")

from app.services.council_service import _parse_ceo_response


class ParseCEOResponseTests(unittest.TestCase):
    def test_parses_auditable_json(self):
        payload = {
            "decision": "Execute um piloto controlado.",
            "reasoning": "O piloto equilibra oportunidade e risco.",
            "confidence": 0.82,
            "consensus": ["Começar pequeno"],
            "disagreements": ["Prazo ideal"],
            "counselor_assessments": [
                {
                    "provider": "deepseek",
                    "strengths": ["Análise quantitativa"],
                    "weaknesses": ["Pouco contexto humano"],
                    "contribution": "Definiu métricas do piloto.",
                    "confidence": 0.8,
                }
            ],
            "risks": ["Amostra pequena"],
            "verification_needed": ["Validar custos"],
            "next_steps": ["Definir hipótese"],
        }

        result = _parse_ceo_response(json.dumps(payload))

        self.assertEqual(result.decision, payload["decision"])
        self.assertEqual(result.confidence, 0.82)
        self.assertEqual(result.counselor_assessments[0].provider, "deepseek")
        self.assertEqual(result.next_steps, ["Definir hipótese"])

    def test_extracts_json_wrapped_in_markdown(self):
        text = '```json\n{"decision":"Seguir","reasoning":"Há consenso","confidence":0.7}\n```'

        result = _parse_ceo_response(text)

        self.assertEqual(result.decision, "Seguir")
        self.assertEqual(result.confidence, 0.7)
        self.assertEqual(result.risks, [])

    def test_falls_back_for_legacy_text(self):
        text = "DECISÃO: Fazer um piloto.\nRACIOCÍNIO: Reduz o risco inicial."

        result = _parse_ceo_response(text)

        self.assertEqual(result.decision, "Fazer um piloto.")
        self.assertEqual(result.reasoning, "Reduz o risco inicial.")
        self.assertEqual(result.confidence, 0.4)
        self.assertTrue(result.verification_needed)

    def test_falls_back_when_confidence_is_invalid(self):
        text = '{"decision":"Seguir","reasoning":"Teste","confidence":2}'

        result = _parse_ceo_response(text)

        self.assertEqual(result.confidence, 0.4)
        self.assertTrue(result.risks)


if __name__ == "__main__":
    unittest.main()
