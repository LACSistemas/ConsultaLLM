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


class AttachmentError(Exception):
    status_code = 400

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


class AttachmentParseError(AttachmentError):
    def __init__(self, filename: str, reason: str):
        self.filename = filename
        self.reason = reason
        super().__init__(f"Não foi possível processar {filename}: {reason}")


class AttachmentTooLargeError(AttachmentError):
    status_code = 413

    def __init__(self, max_bytes: int):
        super().__init__(f"O arquivo excede o limite de {max_bytes // (1024 * 1024)} MB")


class AttachmentNotFoundError(AttachmentError):
    status_code = 404

    def __init__(self):
        super().__init__("Anexo não encontrado para este chat")


async def chat_not_found_handler(request: Request, exc: ChatNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": f"Chat {exc.chat_id} not found"})


async def provider_error_handler(request: Request, exc: ProviderError) -> JSONResponse:
    return JSONResponse(status_code=502, content={"detail": str(exc)})


async def attachment_error_handler(request: Request, exc: AttachmentError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
