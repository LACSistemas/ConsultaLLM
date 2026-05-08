# Como usar o Conselho de IA — macOS

Este guia te leva do zero até o app funcionando no Mac, passo a passo. Não é necessário nenhum conhecimento técnico.

---

## O que você vai precisar instalar

- **Homebrew** — gerenciador de pacotes para Mac
- **Python 3.11 ou superior** — para rodar o servidor
- **Node.js 20 ou superior** — para rodar a interface
- **Chaves de API** de 4 serviços de inteligência artificial (instruções abaixo)

---

## Passo 1 — Abrir o Terminal

O Terminal é o programa onde você vai digitar os comandos deste guia.

1. Pressione **Command (⌘) + Espaço** para abrir o Spotlight
2. Digite **Terminal** e pressione **Enter**

Deixe a janela aberta — você vai usar bastante ela.

---

## Passo 2 — Instalar o Homebrew

O Homebrew facilita a instalação de programas pelo Terminal.

Cole o comando abaixo no Terminal e pressione **Enter**:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

O instalador pode pedir sua senha do Mac e confirmar a instalação das "Command Line Tools" — confirme tudo. O processo leva alguns minutos.

Após terminar, se o terminal mostrar instruções para adicionar o Homebrew ao PATH (comum em Macs com chip Apple Silicon), execute os comandos indicados. Eles costumam ser:

```
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

## Passo 3 — Instalar o Python

Com o Homebrew instalado, execute:

```
brew install python@3.12
```

Verifique se deu certo:

```
python3 --version
```

Deve aparecer algo como `Python 3.12.x`.

---

## Passo 4 — Instalar o Node.js

```
brew install node
```

Verifique:

```
node --version
```

Deve aparecer `v20.x.x` ou superior.

---

## Passo 5 — Instalar o Git

O Git provavelmente já vem instalado no Mac. Verifique:

```
git --version
```

Se não estiver instalado, o Mac vai oferecer instalar automaticamente — aceite. Ou instale via Homebrew:

```
brew install git
```

---

## Passo 6 — Baixar o projeto

No Terminal, vá até a pasta onde quer salvar o projeto (por exemplo, a pasta de Documentos):

```
cd ~/Documents
```

Baixe o projeto:

```
git clone https://github.com/LACSistemas/ConsultaLLM.git
```

Entre na pasta criada:

```
cd ConsultaLLM
```

---

## Passo 7 — Obter as chaves de API

O app usa 4 inteligências artificiais. Você precisa de uma chave de cada serviço.

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

## Passo 8 — Configurar as chaves

1. Ainda no Terminal, dentro da pasta do projeto, execute:

```
cp .env.example backend/.env
```

2. Abra o arquivo para editar:

```
open -e backend/.env
```

Isso abre o arquivo no TextEdit.

3. Preencha cada linha com a chave correspondente:

```
OPENAI_API_KEY=cole_sua_chave_openai_aqui
DEEPSEEK_API_KEY=cole_sua_chave_deepseek_aqui
GEMINI_API_KEY=cole_sua_chave_gemini_aqui
ANTHROPIC_API_KEY=cole_sua_chave_anthropic_aqui
```

4. Salve com **Command (⌘) + S** e feche o TextEdit

> As linhas `DATABASE_URL` e `UPLOAD_DIR` já estão preenchidas corretamente — não mexa nelas.

---

## Passo 9 — Preparar o servidor (backend)

No Terminal, execute os comandos abaixo **um de cada vez**:

```
cd backend
```
```
python3 -m venv .venv
```
```
source .venv/bin/activate
```

O prompt do terminal vai mudar e mostrar `(.venv)` no início — isso significa que o ambiente está ativo.

```
pip install -r requirements.txt
```

Aguarde o download e instalação (pode levar alguns minutos).

---

## Passo 10 — Preparar a interface (frontend)

Abra uma **segunda aba ou janela** do Terminal (**Command + T** para nova aba) e execute:

```
cd ~/Documents/ConsultaLLM/frontend
```

> Ajuste o caminho se salvou o projeto em outro lugar.

```
npm install
```

Aguarde a instalação terminar.

---

## Passo 11 — Rodar o app

Você precisa de **duas janelas/abas do Terminal abertas ao mesmo tempo**.

### Terminal 1 — Servidor (backend)

Se a aba do Passo 9 ainda estiver aberta com `(.venv)` visível, execute:

```
uvicorn main:app --reload
```

Se abriu uma aba nova, ative o ambiente primeiro:

```
cd ~/Documents/ConsultaLLM/backend
source .venv/bin/activate
uvicorn main:app --reload
```

Quando aparecer `Application startup complete`, o servidor está pronto.

### Terminal 2 — Interface (frontend)

```
cd ~/Documents/ConsultaLLM/frontend
npm run dev
```

Quando aparecer `Local: http://localhost:5173`, a interface está pronta.

---

## Passo 12 — Usar o app

1. Abra o Safari, Chrome ou qualquer navegador
2. Acesse **http://localhost:5173**
3. Clique em **Novo Chat**
4. Digite sua pergunta e pressione **Command (⌘) + Enter** (ou clique no botão de enviar)
5. Aguarde — as 3 IAs vão responder em paralelo e o CEO vai consolidar as respostas

Para anexar um arquivo PDF ou planilha XLSX, clique no ícone de clipe antes de enviar.

---

## Usando nas próximas vezes

Não precisa reinstalar nada. Basta abrir dois terminais e repetir o Passo 11:

- **Terminal 1:** `cd ~/Documents/ConsultaLLM/backend` → `source .venv/bin/activate` → `uvicorn main:app --reload`
- **Terminal 2:** `cd ~/Documents/ConsultaLLM/frontend` → `npm run dev`
- Abrir **http://localhost:5173** no navegador

---

## Problemas comuns

**"brew: command not found"**
O Homebrew não foi instalado corretamente. Repita o Passo 2 e siga as instruções ao final, especialmente a parte de adicionar ao PATH.

**"python3: command not found"**
Execute `brew install python@3.12` e tente novamente.

**"npm: command not found"**
Execute `brew install node` e tente novamente. Feche e reabra o Terminal após a instalação.

**"source .venv/bin/activate" não funciona**
Certifique-se de estar dentro da pasta `backend` antes de executar o comando.

**O servidor sobe mas a interface não conecta**
Verifique se o backend está rodando na porta 8000. Se estiver usando outra porta, avise quem te passou o projeto.

**Erro de provider / API Key inválida**
Confira se colou a chave correta no arquivo `backend/.env` sem espaços extras antes ou depois do `=`.

**As respostas não aparecem / ficam carregando para sempre**
Verifique se as duas janelas de terminal estão abertas e sem erros em vermelho.

**Mac com chip Apple Silicon (M1/M2/M3/M4) — erro ao instalar dependências Python**
Execute `brew install cmake` e tente o `pip install -r requirements.txt` novamente.
