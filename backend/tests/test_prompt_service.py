import json
import unittest

from app.services.prompt_service import format_history_as_text, normalize_history


class StructuredHistoryTests(unittest.TestCase):
    def test_replaces_raw_assistant_json_with_structured_memory(self):
        content = json.dumps(
            {
                "decision": "Executar um piloto.",
                "known_facts": ["Há três usuários disponíveis"],
                "assumptions": ["O piloto será reversível"],
                "disagreements": ["Duração do teste"],
                "minority_views": ["Não executar ainda"],
                "unknowns": ["Custo final"],
                "verification_needed": ["Confirmar orçamento"],
            }
        )

        history = normalize_history(
            [
                {"role": "user", "content": "O que devo fazer?"},
                {"role": "assistant", "content": content},
            ]
        )

        self.assertNotIn('"known_facts"', history[1]["content"])
        self.assertIn("Síntese anterior: Executar um piloto.", history[1]["content"])
        self.assertIn("Premissas: O piloto será reversível", history[1]["content"])
        self.assertIn("Visões minoritárias: Não executar ainda", history[1]["content"])

    def test_formats_assistant_as_council_synthesis(self):
        text = format_history_as_text(
            [{"role": "assistant", "content": '{"decision":"Pedir mais dados"}'}]
        )

        self.assertIn("Síntese do conselho: Síntese anterior: Pedir mais dados", text)

    def test_preserves_condensed_prior_counselor_perspectives(self):
        history = normalize_history(
            [
                {
                    "role": "assistant",
                    "content": '{"decision":"Executar piloto"}',
                    "counselor_responses": [
                        {
                            "name": "Cético construtivo",
                            "response": "O custo ainda é desconhecido.",
                            "critique": "A hipótese de demanda precisa de teste.",
                        }
                    ],
                }
            ]
        )

        self.assertIn("Perspectivas anteriores preservadas", history[0]["content"])
        self.assertIn("Cético construtivo: O custo ainda é desconhecido.", history[0]["content"])
        self.assertIn("Revisão: A hipótese de demanda precisa de teste.", history[0]["content"])


if __name__ == "__main__":
    unittest.main()
