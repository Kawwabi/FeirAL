# FeirAL — Plataforma web de feirinhas de Alagoas

O **FeirAL** é um **site** (plataforma web) que reúne, cadastra, gerencia e divulga as feirinhas de
Alagoas. Visitantes descobrem feirinhas pelo **mapa interativo**, pela **agenda de eventos** e por
**categorias**; organizadores cadastram e gerenciam feirinhas e podem impulsioná-las com **anúncios
patrocinados**; administradores moderam conteúdo e monitoram a plataforma; e um **assistente de IA**
(FeiraIA) conversa com os visitantes.

Desenvolvido por **Vinícius Stanley** como **Projeto Integrador VI** da CESMAC.

---

## 1. Tecnologias

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19 + TypeScript** | Site renderizado no servidor (SEO + performance), UI e API no mesmo projeto |
| Estilos | **Tailwind CSS v4** | Layout responsivo e consistente |
| Banco | **SQLite** via **Prisma ORM 6** | Configuração zero (sem Postgres/Docker) e fácil troca para PostgreSQL |
| Autenticação | **Sessão JWT (jose) + bcryptjs** em cookie httpOnly | Simples, com papéis VISITOR / ORGANIZER / ADMIN |
| Mapa | **Leaflet + react-leaflet + OpenStreetMap** | Mapa interativo **sem chave de API** |
| Agenda | Deep link do **Google Agenda** + exportação **.ics** | Integração sem OAuth; funciona offline |
| IA | Adaptador **OpenAI-compatível** com **assistente local de fallback** | Funciona com chave de API ou totalmente offline |
| Validação | **Zod v4** | Validação de formulários e Server Actions |
| Testes | **Vitest** | Testes de regras de domínio |

---

## 2. Requisitos

- **Node.js 20+** (testado com Node 26)
- **npm** (ou pnpm)

Nada mais é necessário: o banco é SQLite e é criado automaticamente.

---

## 3. Instalação e execução

```bash
# 1. instalar dependências
npm install

# 2. gerar o client do Prisma, criar o banco e popular com dados de exemplo
npm run setup

# 3. iniciar o site em modo desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**.

> Se o npm bloquear scripts de instalação (npm 12+):
> `npm install-scripts approve prisma @prisma/client @prisma/engines && npm install-scripts approve esbuild --all && npm rebuild`

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o site em desenvolvimento |
| `npm run build` | Gera o client Prisma e compila para produção |
| `npm run start` | Inicia o servidor de produção (após `build`) |
| `npm run typecheck` | Verificação de tipos (`tsc --noEmit`) |
| `npm test` | Executa os testes com Vitest |
| `npm run setup` | `prisma generate` + `db push` + seed |
| `npm run db:push` | Sincroniza o schema com o banco |
| `npm run db:seed` | Popula o banco com dados de exemplo |
| `npm run db:reset` | Recria o banco do zero e popula novamente |

### Como testar rapidamente (automático)

Com o site rodando (`npm run dev`, em outro terminal):

```bash
# 1) Verificações do código
npm run typecheck        # tipos TypeScript
npm test                 # 50 testes das regras de dominio
npm run build            # compila para producao

# 2) O site respondeu?
curl -o /dev/null -w '%{http_code}\n' http://localhost:3000/            # 200
curl -o /dev/null -w '%{http_code}\n' http://localhost:3000/feirinhas   # 200
curl -o /dev/null -w '%{http_code}\n' http://localhost:3000/mapa        # 200
curl -o /dev/null -w '%{http_code}\n' http://localhost:3000/agenda      # 200

# 3) Area protegida sem login deve redirecionar (307)
curl -o /dev/null -w '%{http_code}\n' http://localhost:3000/admin

# 4) Exports e IA
curl http://localhost:3000/api/agenda/ics | head -3
curl http://localhost:3000/api/ia/status
curl -X POST http://localhost:3000/api/ia/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Qual a agenda de eventos?","history":[]}'
```

### Como testar rapidamente (manual — roteiro sugerido)

1. **Home** (`/`): destaques, patrocinados e próximos eventos aparecem com dados do seed.
2. **Feirinhas** (`/feirinhas`): filtre por categoria "Artesanato", por cidade "Maceió" e por data;
   alterne entre **Grade** e **Lista**.
3. **Mapa** (`/mapa`): os marcadores aparecem em Maceió/Arapiraca/Penedo; clique em um para ver o popup.
4. **Agenda** (`/agenda`): eventos agrupados por dia; clique em **Google Agenda** (abre nova aba) e em
   **Assinar agenda (.ics)** (baixa o arquivo).
5. **Login**: entre com `carla@feiral.app` / `senha123`; depois abra uma feirinha e **avalie com
   estrelas** e **comente**; clique em **Acompanhar feirinha**.
6. **Perfil**: veja a feirinha em *Acompanho*, sua avaliação em *Avaliações* e ajuste as
   *Preferências de notificação*.
7. **Organizador**: saia e entre com `maria@feiral.app` / `senha123` → **Painel** → crie uma feirinha
   (**Nova feirinha**, salve como rascunho e depois envie para aprovação) → veja em **Anúncios**.
8. **Moderação**: entre com `admin@feiral.app` → **Feirinhas e moderação** → aprove a feirinha que você
   enviou; veja **Denúncias**, **Anúncios**, **Usuários** e **Atividade**.
9. **IA**: clique no botão flutuante "Fale com a FeiraIA" (canto inferior direito) e pergunte
   *"Tem feirinha de artesanato em Maceió?"* ou *"Como faço para anunciar minha feirinha?"*.

---

## 4. Contas de demonstração

Todas as contas usam a senha **`senha123`**.

| Perfil | E-mail | Acesso |
|---|---|---|
| Administrador | `admin@feiral.app` | `/admin` (moderação, usuários, anúncios, monitoramento) |
| Organizador | `maria@feiral.app` | `/organizador` (feirinhas, anúncios, feedbacks) |
| Organizador | `joao@feiral.app` | `/organizador` |
| Visitante | `carla@feiral.app` | Perfil, favoritos, avaliações, notificações |
| Visitante | `rafael@feiral.app` | Perfil, favoritos, avaliações, notificações |

O seed cria 6 categorias, 10 feirinhas (a maioria publicada, 1 aguardando revisão e 1 rascunho),
avaliações, comentários (com respostas), feedbacks de organizadores, seguidores, notificações,
4 anúncios patrocinados, 1 denúncia aberta, registros de auditoria e uma conversa de exemplo com a IA.

---

## 5. Funcionalidades implementadas

### Requisito → onde encontrar

| Requisito | Implementação |
|---|---|
| Cadastrar feirinhas com detalhes completos | Formulário do organizador com nome, descrição, data/horário, local (com lat/long), categorias e produtos/serviços |
| Atualizar/editar informações | Edição de feirinha com fluxo rascunho → revisão → publicado |
| Mapa interativo + filtro por localização, data e tipo | `/mapa` com Leaflet/OSM e barra de filtros |
| Listar por categorias | `/categorias` e `/categorias/[slug]` (artesanato, alimentos, moda, eventos culturais, etc.) |
| Agenda de eventos futuros + Google Agenda | `/agenda` agrupada por dia + deep link e exportação `.ics` |
| Avaliar e comentar | Seção de avaliações (estrelas) e comentários com respostas |
| Feedback dos organizadores | Área dedicada com experiência, sugestões e nota de organização |
| Perfis de usuário e preferências de notificação | `/perfil` e `/perfil/preferencias` |
| Acompanhar eventos de interesse | Botão "Acompanhar feirinha" + `/perfil/favoritos` |
| Anúncios patrocinados | `/organizador/anuncios` com 3 planos e métricas (impressões, cliques, CTR) |
| Ferramentas de administrador | `/admin`: conteúdo, moderação, denúncias, usuários e monitoramento (auditoria) |
| IA para conversar com visitantes | Widget flutuante da **FeiraIA** em todas as páginas |

### Detalhes por área

**Visitantes**
- Busca e filtros (texto, categoria, cidade, intervalo de datas, "somente eventos futuros") em
  `/feirinhas`, com visualização em **grade** ou **lista**.
- **Mapa interativo** com marcadores coloridos por categoria.
- **Página da feirinha**: descrição, produtos/serviços, agenda, mapa, contato e organizador.
- **Agenda** com filtros por data/local/categoria, **"Adicionar ao Google Agenda"** e `.ics`.
- **Avaliações** (1–5 estrelas + comentário) com resumo e distribuição de notas.
- **Comentários** com respostas e denúncia de conteúdo.
- **Perfil**: edição de dados, favoritos, minhas avaliações, notificações e preferências.

**Organizadores**
- Cadastro de feirinha com **produtos/serviços** e **agenda de eventos** dinâmicos.
- Salvar como **rascunho** ou **enviar para aprovação**; editar a qualquer momento.
- Pré-visualização da própria feirinha antes da publicação.
- **Anúncios patrocinados** (Básico, Padrão, Premium) com métricas e pausar/ativar.
- **Feedbacks recebidos** de outros organizadores + envio de feedback de participação.

**Administradores**
- **Visão geral**: usuários, feirinhas por status, avaliações, comentários, denúncias abertas,
  anúncios ativos, impressões/cliques e feirinhas por cidade.
- **Moderação de feirinhas**: aprovar, rejeitar (com motivo) e destacar.
- **Denúncias**: resolver, arquivar e **ocultar** o conteúdo denunciado.
- **Anúncios**: aprovar, rejeitar, pausar e reativar.
- **Usuários**: alterar papéis entre visitante, organizador e administrador.
- **Atividade**: registro de auditoria com filtro por ação.

**FeiraIA (IA)**
- Widget de chat **flutuante** em todas as páginas.
- Responde com base nos **dados reais** da plataforma (feirinhas, agenda, categorias, avaliações).
- Usa um provedor compatível com a API OpenAI quando `AI_API_KEY` está definida; caso contrário
  (ou em caso de falha de rede/API) responde com um **assistente local** — o chat nunca fica indisponível.
- As conversas são registradas no banco para monitoramento.

---

## 6. Estrutura do projeto

```
prisma/
  schema.prisma          # modelo de dados (SQLite)
  seed.ts                # dados de exemplo (feirinhas de Alagoas)
scripts/
  generate-covers.mjs    # gera as imagens de capa (SVG) em public/covers
src/
  app/
    actions/             # Server Actions (auth, fairs, community, account, ads, admin)
    api/
      ia/chat/           # endpoint do chatbot
      ia/status/         # diagnóstico do provedor de IA
      agenda/ics/        # exportação .ics
      ads/[id]/click/    # contagem de cliques em anúncios
      logout/            # encerra a sessão
    (páginas públicas)   # /, /feirinhas, /mapa, /agenda, /categorias, /sobre, /entrar...
    perfil/              # área do visitante
    organizador/         # área do organizador
    admin/               # área administrativa
  components/            # componentes de UI (mapa, filtros, chat de IA, formulários...)
  lib/
    auth.ts              # sessão JWT + bcrypt + guardas de papel
    queries.ts           # consultas de leitura
    filters.ts           # filtragem de feirinhas (testado)
    ratings.ts           # agregação de avaliações (testado)
    calendar.ts          # Google Agenda + .ics (testado)
    ai.ts                # camada de IA (chamadas + fallback local)
    ai-config.ts         # resolução de configuração da IA (módulo puro, testável)
    validation.ts        # schemas Zod
    constants.ts         # categorias, status, planos de anúncio
tests/                   # testes Vitest das regras de domínio
```

---

## 7. IA (FeiraIA): LLM local ou nuvem

A FeiraIA tem **4 modos**, definidos por `AI_PROVIDER` no `.env`:

| `AI_PROVIDER` | O que faz | Exige chave? |
|---|---|---|
| `auto` (padrão) | Nuvem se houver `AI_API_KEY`; senão LLM local se a URL for localhost | não |
| `local` | Endpoint **compatível com OpenAI** (Ollama, LM Studio, KoboldCpp `/v1`, etc.) | **não** |
| `openai` | Nuvem (OpenAI ou API compatível) | sim |
| `none` | Somente o assistente local por regras (100% offline) | não |

> **Importante:** se a resposta do LLM falhar (servidor desligado, timeout, erro), o chat **cai
> automaticamente** no assistente local por regras. O site nunca quebra por causa da IA.

### Usando um LLM local (endpoint compatível com OpenAI)

Qualquer servidor local que exponha a API **compatível com OpenAI**
(`/chat/completions`) funciona — **sem chave de API**. Os mais comuns:

```bash
# Ollama
ollama pull llama3.1
AI_PROVIDER="local"
AI_BASE_URL="http://localhost:11434/v1"
AI_MODEL="llama3.1"

# LM Studio (aba Local Server -> Start)
AI_PROVIDER="local"
AI_BASE_URL="http://localhost:1234/v1"
AI_MODEL="nome-do-modelo-carregado"

# KoboldCpp (use o endpoint /v1 compatível com OpenAI que ele expõe)
AI_PROVIDER="local"
AI_BASE_URL="http://localhost:5001/v1"
AI_MODEL="koboldcpp"   # o KoboldCpp ignora o nome do modelo; qualquer valor serve
```

Depois reinicie o site (`npm run dev`) e confirme: `curl http://localhost:3000/api/ia/status`.

> **LLM em outra máquina/container:** a URL não é localhost e o modo `auto` não detecta que é
> local — defina `AI_PROVIDER="local"` explicitamente e use o IP da máquina
> (ex.: `http://192.168.0.10:11434/v1`), habilitando o servidor a escutar em `0.0.0.0`.

> **Timeout:** LLM local em hardware modesto pode demorar a gerar. O tempo de espera padrão é de
> **60s**; para aumentar, defina `AI_TIMEOUT_MS` no `.env` (em milissegundos).

### Nuvem (OpenAI ou compatível)

```bash
AI_PROVIDER="openai"
AI_BASE_URL="https://api.openai.com/v1"
AI_API_KEY="sua-chave"
AI_MODEL="gpt-4o-mini"
```

### Diagnosticar

`GET /api/ia/status` informa o provedor em uso, se exige chave e se o endpoint respondeu:

```bash
curl http://localhost:3000/api/ia/status
# {"provider":"local","baseUrl":"http://localhost:11434/v1","model":"llama3.1",
#  "requiresKey":false,"hasKey":false,"reachable":true,"hints":["Endpoint acessivel..."]}
```

As respostas do chat trazem `engine`: `"llm"` (respondeu o modelo) ou `"local"` (assistente por
regras). O widget mostra isso no cabeçalho ("Assistente de IA" ou "Assistente local (offline)").

---

## 8. Modelo de dados (resumo)

`User` (papéis), `NotificationPreference`, `Category`, `Fair` (com `latitude`/`longitude` e `status`),
`Offering` (produtos/serviços), `FairEvent` (ocorrências da agenda), `Review`, `Comment` (com respostas),
`OrganizerFeedback`, `Follow`, `Notification`, `Advertisement` (anúncios patrocinados),
`ModerationReport`, `Conversation`/`ChatMessage` (IA) e `AuditLog` (monitoramento).

### Trocar SQLite por PostgreSQL
1. Em `prisma/schema.prisma`, altere `provider = "sqlite"` para `provider = "postgresql"`.
2. Ajuste `DATABASE_URL` no `.env` para a string de conexão do Postgres.
3. Execute `npm run db:push` (ou `prisma migrate dev`).

---

## 9. Testes

```bash
npm test
```

Cobrem as regras de domínio: filtragem de feirinhas (texto/categoria/cidade/data/raio geográfico),
agregação de avaliações e distribuição de notas, geração de links do Google Agenda e `.ics`,
formatação e utilitários (slug, distância, moeda, datas).

---

## 10. Considerações e limitações

- **Google Agenda** usa deep link + exportação `.ics` (sem OAuth). É funcional e offline; uma
  integração com a API do Google pode substituir isso depois.
- **SQLite** foi escolhido pela ausência de Postgres/Docker no ambiente; o schema é portável para Postgres.
- **Recuperação de senha**: não há serviço de e-mail no ambiente de demonstração, então o link de
  redefinição é exibido na própria tela.
- **Upload de imagens**: as feirinhas usam URL de imagem ou os arquivos padrão em `public/covers`.
- **Mapa**: requer acesso à internet para carregar os tiles do OpenStreetMap (a aplicação em si
  funciona offline, apenas o mapa precisa de rede).
- As senhas dos usuários de exemplo são apenas para demonstração.