from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.errors import (
    ChatNotFoundError,
    ProviderError,
    AttachmentParseError,
    chat_not_found_handler,
    provider_error_handler,
    attachment_parse_error_handler,
)
from app.core.logging import setup_logging
from app.db.init_db import init_db
from app.api import routes_chats, routes_messages, routes_attachments, routes_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    await init_db()
    yield


app = FastAPI(title="Conselho de IA API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(ChatNotFoundError, chat_not_found_handler)
app.add_exception_handler(ProviderError, provider_error_handler)
app.add_exception_handler(AttachmentParseError, attachment_parse_error_handler)

app.include_router(routes_chats.router, prefix="/api/v1")
app.include_router(routes_messages.router, prefix="/api/v1")
app.include_router(routes_attachments.router, prefix="/api/v1")
app.include_router(routes_settings.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
