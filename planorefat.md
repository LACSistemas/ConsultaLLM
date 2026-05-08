Plano: Refatoração Conselho de IA → llm-council
Context
O projeto atual (conselho-ia/) é um monólito Next.js com apenas 2 LLMs reais (OpenAI + Gemini, Anthropic é simulado com Gemini), sem banco de dados (usa localStorage), sem upload de arquivos e sem múltiplos chats. O objetivo é refatorar para a arquitetura descrita em error.md: backend FastAPI separado + frontend Vite/React separado, com os 4 modelos reais, SQLite persistente, múltiplos chats e upload de PDF/XLSX.

Abordagem menos destrutiva: criar backend/ e frontend/ ao lado do conselho-ia/ existente, que não será tocado até o novo sistema estar validado.

Estrutura de arquivos a criar
c:\Projetos\conselhoIA\
├── conselho-ia/          ← NÃO TOCAR (referência)
├── backend/              ← NOVO (FastAPI + Python)
├── frontend/             ← NOVO (Vite + React)
├── .env.example          ← NOVO
├── .gitignore            ← NOVO
└── README.md             ← NOVO
Fase 1: Backend (backend/)
Arquivos raiz
Arquivo	O que faz
requirements.txt	fastapi, uvicorn, sqlalchemy[asyncio], aiosqlite, pydantic, python-dotenv, openai, google-generativeai, anthropic, pymupdf, openpyxl, python-multipart
main.py	App FastAPI: monta routers, CORS para localhost:5173, chama init_db() no startup
.env.example	Template com OPENAI_API_KEY, DEEPSEEK_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, DATABASE_URL, UPLOAD_DIR
app/core/
config.py — Settings singleton via python-dotenv, expõe todas as API keys
errors.py — Exceções customizadas + handlers FastAPI (ProviderError → 502, ChatNotFoundError → 404)
logging.py — Config de logging para stdout
app/db/
database.py — SQLAlchemy async engine + AsyncSession como dependência FastAPI
models.py — 3 modelos ORM:
Chat: id (UUID), title, created_at, updated_at
Message: id, chat_id (FK), role ("user"|"assistant"), content (CEO decision text), counselor_responses (JSON), created_at
Attachment: id, message_id (FK), filename, file_type, parsed_text, file_path
init_db.py — Base.metadata.create_all() + cria storage/uploads/ se não existir
app/schemas/
Pydantic schemas separados dos modelos ORM, espelham o que a API aceita/retorna:

chat.py: ChatCreate, ChatRead, ChatList
message.py: MessageCreate, MessageRead, CounselorResponse, CEODecision
attachment.py: AttachmentRead
council.py: CouncilRequest, CouncilResponse
app/providers/ ← abstração central
base.py — Abstract LLMProvider com método async complete(system: str, messages: list[dict]) -> str
deepseek_provider.py — Agente A: usa openai SDK apontado para https://api.deepseek.com/v1, modelo deepseek-chat
gemini_provider.py — Agente B: usa google-generativeai, modelo gemini-2.0-flash
anthropic_provider.py — Agente C (REAL desta vez): usa SDK anthropic, modelo claude-3-5-haiku-20241022
openai_provider.py — CEO: usa openai SDK, modelo gpt-4o-mini, método extra complete_as_ceo()
app/services/
council_service.py ← PORT de conselho-ia/src/app/api/ai-council/route.ts
Usa asyncio.gather(return_exceptions=True) para chamar os 3 conselheiros em paralelo (melhoria de ~3x vs sequencial atual)
CEO prompt mantém o formato DECISÃO:/RACIOCÍNIO: do código atual, mas adiciona histórico da conversa e contexto de anexos
Provider failure retorna placeholder em vez de crashar o request
chat_service.py — CRUD: create_chat, get_chat, list_chats, add_message, get_chat_history (últimos 10 pares), auto_title_chat
attachment_service.py — Recebe UploadFile, salva no disco, chama pdf/xlsx service, cria registro no DB
pdf_service.py — PyMuPDF: fitz.open() + page.get_text() por página
xlsx_service.py — openpyxl: itera sheets e rows, converte para texto tab-separado
prompt_service.py — format_history_for_llm(), format_attachment_context(), truncate_history(max=20 msgs)
app/api/
Todos com prefixo /api/v1:

routes_chats.py: GET/POST /chats, GET/PATCH/DELETE /chats/{id}
routes_messages.py: POST /chats/{id}/messages (main endpoint), GET /chats/{id}/messages
routes_attachments.py: POST /chats/{id}/attachments (multipart), GET /attachments/{id}
routes_settings.py: GET /settings (retorna flags booleanas de quais providers estão configurados — nunca expõe as keys)
Fase 2: Frontend (frontend/)
Raiz
Arquivo	O que faz
package.json	react 19, react-router-dom 7, @tanstack/react-query 5, axios, lucide-react, @radix-ui/*, tailwindcss 4, vite, typescript
vite.config.ts	plugin react + tailwindcss, alias @ → ./src, proxy /api → http://localhost:8000
tsconfig.json	strict mode, path alias @/*
index.html	Shell Vite, title "Conselho de IA"
Código-fonte
src/main.tsx — entry: <QueryClientProvider> + <BrowserRouter>
src/App.tsx — rotas: /chat → ChatPage, /chat/:chatId → ChatPage, /settings → SettingsPage, * → NotFoundPage
src/lib/utils.ts — COPIAR de conselho-ia/src/lib/utils.ts (sem mudanças)
src/components/ui/ — COPIAR os 5 arquivos de conselho-ia/src/components/ui/ (button, card, badge, textarea, separator — sem mudanças, zero deps Next.js)
src/types/index.ts
Interfaces TypeScript espelhando schemas do backend: Chat, Message, CounselorResponse, CEODecision, Attachment, CouncilResponse

src/api/
client.ts — axios instance com baseURL: '/api/v1'
chats.ts — listChats, getChat, createChat, deleteChat, renameChat
messages.ts — getMessages, sendMessage
attachments.ts — uploadAttachment (multipart/form-data)
src/hooks/
TanStack Query hooks:

useChats.ts — useChats, useCreateChat, useDeleteChat
useMessages.ts — useMessages, useSendMessage (invalida ['messages', chatId] + ['chats'] on success)
useAttachments.ts — useUploadAttachment
src/components/
layout/
  AppShell.tsx      — grid 2 colunas: sidebar + main, gradient bg da page.tsx atual
  Sidebar.tsx       — lista chats, botão "Novo Chat", highlight do chat ativo

chat/
  ChatHeader.tsx    — título do chat com botão renomear inline
  MessageList.tsx   — lista msgs: user bubbles + <CounselorPanel>+<CEOCard> por assistant msg
  MessageInput.tsx  — Textarea + botão anexo (PDF/XLSX) + chips de arquivos pendentes + Submit

council/
  CounselorCard.tsx — PORT do map de conselheiros em page.tsx; cor por provider string (deepseek=blue, gemini=green, anthropic=purple)
  CounselorPanel.tsx — grid 3 colunas de CounselorCards + heading
  CEOCard.tsx       — PORT direto do CEO card de page.tsx (border-yellow, Crown icon, badges)
  LoadingCounselors.tsx — PORT do animate-pulse skeleton de page.tsx

attachments/
  AttachmentChip.tsx — pill com nome do arquivo + X para remover antes de enviar
src/pages/
ChatPage.tsx — composição: AppShell > ChatHeader + MessageList + MessageInput; lê chatId via useParams(); sem chatId mostra tela de boas-vindas
SettingsPage.tsx — exibe quais providers estão configurados (via GET /settings), instrução para editar .env
NotFoundPage.tsx — 404 simples com link para /chat
Ordem de implementação
Backend skeleton — requirements, main, core, db (sem LLMs ainda) → verificar uvicorn main:app sobe
Chat CRUD — chat_service + routes_chats → verificar POST/GET /chats no Swagger
Providers — base + 4 providers → testar com script test_providers.py direto
Council service + rotas de mensagens — council_service, attachment pipeline, routes_messages, routes_attachments → verificar POST /api/v1/chats/{id}/messages retorna JSON com 3 conselheiros + CEO
Frontend scaffold — package.json, vite.config, main.tsx, App.tsx, copiar ui/ + utils.ts → verificar npm run dev sobe
API layer + hooks — types, api/, hooks/ → verificar fetch funciona via devtools
Componentes UI — layout, chat, council, attachments components
Pages — ChatPage, SettingsPage, NotFoundPage
Root files — README, .env.example, .gitignore
Verificação end-to-end
GET /docs — Swagger UI com todas as rotas visíveis
POST /api/v1/chats + POST /api/v1/chats/{id}/messages → resposta com 3 conselheiros reais (providers diferentes) + CEO decision
Segunda mensagem referenciando a primeira → respostas refletem contexto do histórico
Upload de PDF → enviar mensagem com esse attachment_id → CEO menciona conteúdo do PDF
Frontend: sidebar mostra chats, envio retorna counselor cards + CEO card visuais
Reload do browser → chats persistem (SQLite via API, não localStorage)
cd conselho-ia && npm run dev → app original ainda funciona (não foi tocado)
Arquivos críticos (ler antes de implementar)
conselho-ia/src/app/api/ai-council/route.ts — lógica de orquestração + formato DECISÃO/RACIOCÍNIO a portar
conselho-ia/src/app/page.tsx — UI de conselheiros e CEO a adaptar em componentes
conselho-ia/src/components/ui/ — 5 componentes a copiar diretamente