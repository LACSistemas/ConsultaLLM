# Projeto: LLM Council Local App

## Objetivo

Criar uma aplicação local com interface moderna em React + Shadcn UI e backend em FastAPI, onde o usuário conversa com um “conselho de LLMs”.

A cada mensagem do usuário:

1. A pergunta e o contexto do chat são enviados em paralelo para:
   - DeepSeek = Agente A
   - Gemini = Agente B
   - Anthropic = Agente C

2. Depois, a OpenAI recebe:
   - mensagem original do usuário
   - histórico relevante da conversa
   - resposta do DeepSeek
   - resposta do Gemini
   - resposta do Anthropic
   - contexto de anexos PDF/XLSX, se houver

3. A OpenAI atua como “CEO/Juiz” e gera a resposta final consolidada.

A aplicação deve permitir:
- múltiplos chats
- continuidade de conversa
- upload de PDF
- upload de XLSX
- visualização das respostas individuais dos agentes
- visualização da resposta final do CEO
- configuração das API keys via `.env`
- execução local simples
- README completo para pessoa sem conhecimento técnico conseguir rodar

---

# Stack obrigatória

## Backend

- Python 3.11+
- FastAPI
- Uvicorn
- SQLite no MVP
- SQLAlchemy ou SQLModel
- Pydantic
- python-dotenv
- httpx ou SDKs oficiais quando fizer sentido
- PyMuPDF para PDF
- openpyxl para XLSX
- asyncio para chamadas paralelas aos modelos

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- TanStack Query
- React Router
- Axios
- Lucide React

---

# Estrutura esperada do projeto

```text
llm-council/
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml                # opcional, mas desejável
├── backend/
│   ├── README.md
│   ├── requirements.txt
│   ├── main.py
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   └── errors.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── init_db.py
│   │   ├── api/
│   │   │   ├── routes_chats.py
│   │   │   ├── routes_messages.py
│   │   │   ├── routes_attachments.py
│   │   │   └── routes_settings.py
│   │   ├── services/
│   │   │   ├── council_service.py
│   │   │   ├── chat_service.py
│   │   │   ├── attachment_service.py
│   │   │   ├── pdf_service.py
│   │   │   ├── xlsx_service.py
│   │   │   └── prompt_service.py
│   │   ├── providers/
│   │   │   ├── base.py
│   │   │   ├── openai_provider.py
│   │   │   ├── deepseek_provider.py
│   │   │   ├── gemini_provider.py
│   │   │   └── anthropic_provider.py
│   │   └── schemas/
│   │       ├── chat.py
│   │       ├── message.py
│   │       ├── attachment.py
│   │       └── council.py
│   └── storage/
│       └── uploads/
│
└── frontend/
    ├── README.md
    ├── package.json
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── api/
    │   │   ├── client.ts
    │   │   ├── chats.ts
    │   │   ├── messages.ts
    │   │   └── attachments.ts
    │   ├── components/
    │   │   ├── layout/
    │   │   ├── chat/
    │   │   ├── council/
    │   │   ├── attachments/
    │   │   └── ui/
    │   ├── pages/
    │   │   ├── ChatPage.tsx
    │   │   ├── SettingsPage.tsx
    │   │   └── NotFoundPage.tsx
    │   ├── hooks/
    │   ├── types/
    │   └── lib/
    └── public/


  