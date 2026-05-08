import google.generativeai as genai

from app.core.config import settings
from app.core.errors import ProviderError
from app.providers.base import LLMProvider

SYSTEM_PROMPT = (
    "Você é um conselheiro criativo e inovador. Explore perspectivas não convencionais e conexões "
    "inesperadas. Seja inspirador e prático, mas conciso."
)


class GeminiProvider(LLMProvider):
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self._model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )

    async def complete(self, system: str, messages: list[dict]) -> str:
        try:
            history = []
            for m in messages[:-1]:
                role = "user" if m["role"] == "user" else "model"
                history.append({"role": role, "parts": [m["content"]]})

            last_msg = messages[-1]["content"] if messages else ""
            chat = self._model.start_chat(history=history)
            resp = await chat.send_message_async(last_msg)
            return resp.text or ""
        except Exception as e:
            raise ProviderError("Gemini", str(e)) from e
