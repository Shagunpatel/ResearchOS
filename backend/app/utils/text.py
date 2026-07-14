import re

def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\x00", "")
    text = text.replace("\ufeff", "")

    # Remove other ASCII control chars except newline/tab
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)

    return text.strip()