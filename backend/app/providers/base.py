from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    async def complete(self, system: str, messages: list[dict]) -> str:
        """
        system: system prompt string
        messages: list of {"role": "user"|"assistant", "content": str}
        Returns the text completion.
        """
        ...
