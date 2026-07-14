from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, *, prompt: str, json_mode: bool = False) -> str:
        pass