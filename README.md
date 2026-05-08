# Conselho de IA

Aplicação local onde você conversa com um conselho de LLMs. Cada pergunta é enviada em paralelo para **DeepSeek**, **Gemini** e **Anthropic Claude**, e a **OpenAI** atua como CEO consolidando as respostas.

## Pré-requisitos

- Python 3.11 ou superior
- Node.js 20 ou superior
- npm

## Configuração rápida

### 1. Configure as API Keys

Copie o arquivo de exemplo e preencha suas chaves:

```bash
cp .env.example backend/.env
```

Edite `backend/.env`:

```
OPENAI_API_KEY=sk-...        # openai.com
DEEPSEEK_API_KEY=sk-...      # platform.deepseek.com
GEMINI_API_KEY=AIza...       # aistudio.google.com
ANTHROPIC_API_KEY=sk-ant-... # console.anthropic.com
```

As chaves `DATABASE_URL` e `UPLOAD_DIR` já têm valores padrão — não precisa alterar.

### 2. Inicie o Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

O servidor sobe em `http://localhost:8000`. Acesse `http://localhost:8000/docs` para ver a API.

### 3. Inicie o Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Como usar

1. Clique em **Novo Chat** na barra lateral
2. Digite sua pergunta na caixa de texto
3. Opcionalmente, clique no clipe para anexar um PDF ou planilha XLSX
4. Pressione o botão de envio ou **Ctrl+Enter**
5. Aguarde as respostas dos 3 conselheiros e a decisão final do CEO

## Estrutura do projeto

```
conselho-ia/       ← versão anterior (Next.js) — referência
backend/           ← API FastAPI + Python
frontend/          ← Interface React + Vite
```

## Solução de problemas

**Backend não sobe**: verifique se o Python é 3.11+ com `python --version`

**Frontend não conecta ao backend**: certifique-se de que o backend está rodando na porta 8000

**Erro de provider**: verifique se a API key correspondente está preenchida no `backend/.env`
