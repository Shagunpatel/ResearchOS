import httpx

from app.ai.llm.base import LLMProvider


class OllamaProvider(LLMProvider):
    def __init__(
        self,
        model: str = "llama3.2:3b",
        base_url: str = "http://localhost:11434",
    ):
        self.model = model
        self.base_url = base_url

    def generate(self, *, prompt: str, json_mode: bool = False) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }

        if json_mode:
            payload["format"] = "json"

        response = httpx.post(
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=120,
        )
        response.raise_for_status()
        return response.json()["response"]