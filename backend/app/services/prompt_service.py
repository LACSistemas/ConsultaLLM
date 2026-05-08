MAX_HISTORY_CHARS = 8000
MAX_ATTACHMENT_CHARS = 6000


def format_history_for_llm(messages: list[dict]) -> list[dict]:
    return messages


def format_history_as_text(messages: list[dict]) -> str:
    if not messages:
        return ""
    lines = []
    for m in messages:
        role = "Usuário" if m["role"] == "user" else "Assistente"
        lines.append(f"{role}: {m['content']}")
    return "\n".join(lines)


def format_attachment_context(texts: list[str]) -> str:
    if not texts:
        return ""
    combined = "\n\n---\n\n".join(texts)
    if len(combined) > MAX_ATTACHMENT_CHARS:
        combined = combined[:MAX_ATTACHMENT_CHARS] + "\n[... conteúdo truncado]"
    return combined


def truncate_history(messages: list[dict], max_msgs: int = 20) -> list[dict]:
    return messages[-max_msgs:]
