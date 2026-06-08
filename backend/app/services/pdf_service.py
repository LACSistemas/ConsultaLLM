import fitz


def extract_text(file_path: str, *, max_pages: int, max_chars: int) -> str:
    parts: list[str] = []
    char_count = 0

    with fitz.open(file_path) as doc:
        if doc.page_count > max_pages:
            raise ValueError(f"PDF excede o limite de {max_pages} páginas")

        for page in doc:
            page_text = page.get_text()
            remaining = max_chars - char_count
            if remaining <= 0:
                break
            parts.append(page_text[:remaining])
            char_count += min(len(page_text), remaining)

    return "\n".join(parts)
