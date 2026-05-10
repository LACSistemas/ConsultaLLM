from fastapi import Request
from fastapi.responses import JSONResponse


class ChatNotFoundError(Exception):
    def __init__(self, chat_id: str):
        self.chat_id = chat_id


class ProviderError(Exception):
    def __init__(self, provider: str, message: str):
        self.provider = provider
        self.message = message
        super().__init__(f"{provider}: {message}")


class AttachmentParseError(Exception):
    def __init__(self, filename: str, reason: str):
        self.filename = filename
        self.reason = reason
        super().__init__(f"Cannot parse {filename}: {reason}")


async def chat_not_found_handler(request: Request, exc: ChatNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": f"Chat {exc.chat_id} not found"})


async def provider_error_handler(request: Request, exc: ProviderError) -> JSONResponse:
    return JSONResponse(status_code=502, content={"detail": str(exc)})


async def attachment_parse_error_handler(request: Request, exc: AttachmentParseError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})
