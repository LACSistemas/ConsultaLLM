# Como usar o Conselho de IA

Este guia te leva do zero até o app funcionando, passo a passo. Não é necessário nenhum conhecimento técnico.

---

## O que você vai precisar instalar

- **Git** — para baixar o projeto
- **Python 3.11 ou superior** — para rodar o servidor
- **Node.js 20 ou superior** — para rodar a interface
- **Chaves de API** de 4 serviços de inteligência artificial (instruções abaixo)

---

## Passo 1 — Instalar o Git

1. Acesse **https://git-scm.com/downloads**
2. Clique em **Download for Windows**
3. Abra o instalador e clique em **Next** em todas as telas (as opções padrão estão corretas)
4. Ao final, clique em **Finish**

---

## Passo 2 — Instalar o Python

1. Acesse **https://www.python.org/downloads/**
2. Clique no botão grande **Download Python 3.x.x**
3. Abra o instalador
4. **IMPORTANTE:** Marque a caixa **"Add Python to PATH"** antes de clicar em qualquer coisa
5. Clique em **Install Now**
6. Aguarde e clique em **Close** ao terminar

---

## Passo 3 — Instalar o Node.js

1. Acesse **https://nodejs.org/**
2. Clique no botão **LTS** (versão recomendada)
3. Abra o instalador e clique em **Next** em todas as telas
4. Clique em **Finish** ao terminar

---

## Passo 4 — Baixar o projeto

1. Clique com o botão direito na área de trabalho (ou em qualquer pasta onde queira guardar o projeto)
2. Escolha **"Abrir no Terminal"** (ou "Open in Terminal")
   - No Windows 11 essa opção aparece diretamente
   - No Windows 10, procure por **"Prompt de Comando"** no menu Iniciar
3. Cole o comando abaixo e pressione **Enter**:

```
git clone https://github.com/LACSistemas/ConsultaLLM.git
```

4. Uma pasta chamada **`ConsultaLLM`** será criada. Entre nela:

```
cd ConsultaLLM
```

---

## Passo 5 — Obter as chaves de API

O app usa 4 inteligências artificiais. Você precisa de uma chave gratuita (ou paga) de cada serviço.

### OpenAI (GPT)
1. Acesse **https://platform.openai.com/**
2. Crie uma conta ou faça login
3. No menu lateral, clique em **API Keys**
4. Clique em **Create new secret key**, dê um nome qualquer e copie a chave (começa com `sk-`)

### DeepSeek
1. Acesse **https://platform.deepseek.com/**
2. Crie uma conta ou faça login
3. No menu, procure por **API Keys** e crie uma nova chave (começa com `sk-`)

### Google Gemini
1. Acesse **https://aistudio.google.com/**
2. Faça login com sua conta Google
3. Clique em **Get API Key** → **Create API key**
4. Copie a chave gerada (começa com `AIza`)

### Anthropic (Claude)
1. Acesse **https://console.anthropic.com/**
2. Crie uma conta ou faça login
3. No menu, clique em **API Keys** → **Create Key**
4. Copie a chave (começa com `sk-ant-`)

---

## Passo 6 — Configurar as chaves

1. Dentro da pasta do projeto, abra a pasta **`backend`**
2. Você vai ver um arquivo chamado **`.env.example`**
3. Faça uma **cópia** desse arquivo e renomeie a cópia para **`.env`** (só `.env`, sem o `.example`)
   - No Windows Explorer, pode ser que o arquivo apareça apenas como `env.example` — isso é normal
4. Abra o arquivo `.env` com o **Bloco de Notas**
5. Preencha cada linha com a chave correspondente:

```
OPENAI_API_KEY=cole_sua_chave_openai_aqui
DEEPSEEK_API_KEY=cole_sua_chave_deepseek_aqui
GEMINI_API_KEY=cole_sua_chave_gemini_aqui
ANTHROPIC_API_KEY=cole_sua_chave_anthropic_aqui
```

6. Salve o arquivo (**Ctrl+S**)

> As linhas `DATABASE_URL` e `UPLOAD_DIR` já estão preenchidas corretamente — não mexa nelas.

---

## Passo 7 — Preparar o servidor (backend)

Abra o **Terminal** dentro da pasta do projeto (veja Passo 4 se não souber como) e execute os comandos abaixo **um de cada vez**, esperando cada um terminar antes de digitar o próximo:

```
cd backend
```
```
python -m venv .venv
```
```
.venv\Scripts\Activate.ps1
```

> Se aparecer um erro sobre "execução de scripts desabilitada", execute este comando e tente novamente:
> ```
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

```
pip install -r requirements.txt
```

Aguarde o download e instalação de todas as dependências (pode levar alguns minutos).

---

## Passo 8 — Preparar a interface (frontend)

Abra um **segundo terminal** (deixe o primeiro aberto) e vá até a pasta do projeto novamente:

```
cd caminho\para\a\pasta\do\projeto\frontend
```

```
npm install
```

Aguarde a instalação terminar.

---

## Passo 9 — Rodar o app

Você precisa de **dois terminais abertos ao mesmo tempo**.

### Terminal 1 — Servidor (backend)

Se o terminal do Passo 7 ainda estiver aberto com o venv ativo, execute:

```
uvicorn main:app --reload
```

Se abriu um terminal novo, ative o venv antes:

```
cd caminho\para\a\pasta\do\projeto\backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

Quando aparecer `Application startup complete`, o servidor está pronto.

### Terminal 2 — Interface (frontend)

```
cd caminho\para\a\pasta\do\projeto\frontend
npm run dev
```

Quando aparecer `Local: http://localhost:5173`, a interface está pronta.

---

## Passo 10 — Usar o app

1. Abra o navegador (Chrome, Firefox, Edge...)
2. Acesse **http://localhost:5173**
3. Clique em **Novo Chat**
4. Digite sua pergunta e pressione **Ctrl+Enter** (ou clique no botão de enviar)
5. Aguarde — as 3 IAs vão responder em paralelo e o CEO vai consolidar as respostas

Para anexar um arquivo PDF ou planilha XLSX, clique no ícone de clipe antes de enviar.

---

## Usando nas próximas vezes

Não precisa reinstalar nada. Basta abrir dois terminais e repetir o **Passo 9**:

- **Terminal 1:** `cd backend` → `.venv\Scripts\Activate.ps1` → `uvicorn main:app --reload`
- **Terminal 2:** `cd frontend` → `npm run dev`
- Abrir **http://localhost:5173** no navegador

---

## Problemas comuns

**"python não é reconhecido como comando"**
Reinstale o Python marcando a opção **"Add Python to PATH"** no instalador.

**"npm não é reconhecido como comando"**
Reinstale o Node.js e reinicie o terminal após a instalação.

**"Erro de execução de scripts" ao ativar o venv**
Execute `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` no terminal e tente novamente.

**O servidor sobe mas a interface não conecta**
Verifique se o backend está rodando na porta 8000. Se estiver usando outra porta, avise quem te passou o projeto.

**Erro de provider / API Key inválida**
Confira se colou a chave correta no arquivo `backend\.env` sem espaços extras antes ou depois do `=`.

**As respostas não aparecem / ficam carregando para sempre**
Verifique se as duas janelas de terminal estão abertas e sem erros em vermelho.
