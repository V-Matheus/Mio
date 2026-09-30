# Deploy — Infraestrutura do Mio

Descreve como a plataforma Mio roda em um ambiente de deploy que ofereça **Linux, Docker Engine e Docker Compose 2.24 ou posterior** (a raiz usa `include` e os scripts de operação combinam dois arquivos de interpolação). O perfil atual usa uma VM e containers numa rede interna compartilhada; os mesmos artefatos podem ser executados em outro host Docker compatível.

> Para a arquitetura de software (domínios, padrões, protocolos), veja [`ARCHITECTURE.md`](../ARCHITECTURE.md). Este documento trata apenas de **como o sistema é empacotado e executado**.

---

## 1. Visão Geral

```
                                 VM (Docker Engine)
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│ :80/443 ┌─────────┐ :3000 ┌─────────┐ GraphQL ┌─────────────┐                   │
│ ◄───────│  Nginx  │──────►│   web   │────────►│ api-gateway │ :3333            │
│         │  host   │loopback│ Next.js│          │ NestJS/GQL  │                   │
│         └─────────┘                   └──────┬──────┘                            │
│                                              │ gRPC                              │
│              ┌───────────────┬───────────────┼───────────────┬──────────────┐    │
│              ▼               ▼               ▼               ▼              ▼    │
│        ┌──────────┐  ┌──────────────┐ ┌──────────────┐ ┌───────────┐ ┌───────────────┐
│        │ api-core │  │api-gamificat.│ │api-achievem. │ │api-messen.│ │api-notificat. │
│        │  :5001   │  │    :5002     │ │    :5003     │ │   :5004   │ │     :5005     │
│        └────┬─────┘  └──────┬───────┘ └──────┬───────┘ └───────────┘ └───────┬───────┘
│             │               │                │                               │   │
│             ▼               ▼                ▼                               │   │
│      postgres-core  postgres-gamif.  postgres-achiev.                        │   │
│                                                                              │   │
│        ┌────────────────── rabbitmq (exchange mio.events) ◄──────────────────┤   │
│        │                                                                     │   │
│        └────────────────── redis (cache · ZSet · BullMQ) ◄───────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **12 containers em execução contínua**: 7 de aplicação + 5 de infraestrutura; `api-migrate` é um job one-shot obrigatório.
- **2 imagens de aplicação**: `mio-api` (compartilhada pelos 6 serviços NestJS) e `mio-web`.
- **1 rede Docker** (a rede padrão do projeto Compose): todos os containers se enxergam pelo **nome do serviço** via DNS interno do Docker.
- **5 volumes nomeados** para os dados persistentes.

---

## 2. Do Monorepo às Imagens

O monorepo (Yarn Workspaces + Turborepo) existe apenas em **tempo de build**. Em execução não há monorepo — só imagens autocontidas.

```
monorepo
 ├─ apps/api ─────────────────┐
 ├─ packages/grpc-contracts ──┤  turbo prune @mio/api --docker  ──►  imagem mio-api
 ├─ packages/typescript-config┘  + yarn install + turbo build
 │
 └─ apps/web ─────────────────── turbo prune @mio/web --docker  ──►  imagem mio-web
```

Ambos os Dockerfiles seguem o mesmo pipeline multi-stage:

| Stage | O que faz |
| :--- | :--- |
| `pruner` | `turbo prune <app> --docker` isola do monorepo apenas o app e os pacotes internos dos quais ele depende. |
| `installer` | Instala dependências a partir de `out/json/` (camada cacheável: só invalida quando `package.json`/`yarn.lock` mudam). O `postinstall` da API roda `prisma generate` para os 3 schemas. |
| `builder` | Copia dependências e os clientes Prisma gerados, depois copia o código podado (`out/full/`) e roda `turbo build --filter=<app>`. |
| `runner` | Imagem final `node:24-alpine`, usuário sem privilégios (UID 1001), artefatos compilados, dependências, clientes Prisma e migrations. |

### 2.1 Imagem `mio-api` — uma imagem, seis serviços

O build da API compila **todos os microsserviços** NestJS em um único `dist/`:

```
dist/apps/
 ├─ gateway/main.js
 ├─ core/main.js
 ├─ gamification/main.js
 ├─ achievements/main.js
 ├─ messenger/main.js
 └─ notifications/main.js
```

O processo iniciado é escolhido em **tempo de execução** pela variável `SERVICE`:

```dockerfile
CMD ["sh", "-c", "node dist/apps/${SERVICE}/main.js"]
```

No Compose, apenas `api-gateway` declara `build:`; os demais reutilizam `image: mio-api` e definem somente `SERVICE`. A imagem é construída uma vez e instanciada seis vezes.

### 2.2 Imagem `mio-web`

Next.js compilado em modo **standalone** (`.next/standalone` + `.next/static` + `public/`), iniciado com `node apps/web/server.js` na porta `3000`.

---

## 3. Containers

### 3.1 Aplicação

| Container | Imagem | `SERVICE` | Porta | Protocolo | Depende de |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `web` | `mio-web` | — | 3000 | HTTP publicado somente em `127.0.0.1` | `api-gateway` saudável |
| `api-gateway` | `mio-api` | `gateway` | 3333 | HTTP (GraphQL + `/health`), rede interna | `api-migrate`, `redis`, `rabbitmq` |
| `api-migrate` | `mio-api` | job | — | Prisma CLI, execução única | Postgres saudáveis |
| `api-ops` | `mio-api` | job sob demanda | — | Scripts operacionais compilados | `api-migrate`, Redis saudável |
| `api-core` | `mio-api` | `core` | 5001 | gRPC | `postgres-core` |
| `api-gamification` | `mio-api` | `gamification` | 5002 | gRPC | `postgres-gamification` |
| `api-achievements` | `mio-api` | `achievements` | 5003 | gRPC | `postgres-achievements` |
| `api-messenger` | `mio-api` | `messenger` | 5004 | gRPC | — |
| `api-notifications` | `mio-api` | `notifications` | 5005 | gRPC | — |

- Apenas `web` é publicado no host. O gateway e os demais serviços são alcançáveis somente pela rede interna; Postgres, Redis e RabbitMQ também não publicam portas no host.
- Os endereços gRPC são **fixos no código** pelo nome do container (`api-core`, `api-gamification`, `api-achievements`) em `apps/gateway/src/grpc/registry.ts`, `apps/gateway/src/modules/health/health.module.ts` e nos `*-client.registry.ts`. Por isso todos os serviços da API precisam compartilhar a mesma rede Docker.
- O gateway expõe `GET /health/live` (liveness) e `GET /health/ready` (readiness, verifica os serviços gRPC).

### 3.2 Dados e Mensageria

| Container | Imagem | Porta interna | Volume | Usado por |
| :--- | :--- | :--- | :--- | :--- |
| `postgres-core` | `postgres:18-alpine` | 5432 | `postgres-core-data` | `api-core` |
| `postgres-gamification` | `postgres:18-alpine` | 5432 | `postgres-gamification-data` | `api-gamification` |
| `postgres-achievements` | `postgres:18-alpine` | 5432 | `postgres-achievements-data` | `api-achievements` |
| `redis` | `redis:8-alpine` | 6379 | `redis-data` | `api-gateway`, `api-gamification`, `api-notifications` |
| `rabbitmq` | `rabbitmq:4-management-alpine` | 5672 (AMQP), 15672 (painel) | `rabbitmq-data` | `api-core`, `api-gamification`, `api-achievements`, `api-notifications` |

**Database-per-service:** cada serviço com estado tem sua própria instância Postgres. Nenhum serviço acessa o banco de outro; dados cruzados trafegam via gRPC ou eventos.

**Uso do Redis por serviço:**

| Serviço | Uso |
| :--- | :--- |
| `api-gateway` | Controle de sessões / rotação de refresh token (invalidação de JTI). |
| `api-gamification` | Leaderboard em Sorted Set (ZSet). |
| `api-notifications` | Fila de jobs de e-mail (BullMQ). |

---

## 4. Comunicação

| Origem → Destino | Protocolo | Endereço interno |
| :--- | :--- | :--- |
| Navegador → Nginx | HTTPS (HTTP redireciona para HTTPS) | `:443` (`:80` para redirecionamento/ACME) |
| Nginx → `web` | HTTP local | `127.0.0.1:3000` |
| `web` (server-side) → `api-gateway` | HTTP / GraphQL | `http://api-gateway:3333/graphql` (`GATEWAY_GRAPHQL_URL`) |
| `api-gateway` → microsserviços | gRPC | `api-<servico>:500X` |
| `api-gamification` / `api-achievements` → `api-core` | gRPC | `api-core:5001` |
| `api-achievements` → `api-gamification` | gRPC | `api-gamification:5002` |
| Serviços → Postgres | TCP | `postgres-<servico>:5432` (`*_DATABASE_URL`) |
| Serviços → Redis | TCP | `redis:6379` (`REDIS_URL`) |
| Serviços → RabbitMQ | AMQP | `rabbitmq:5672` (`RABBITMQ_URL`) |

O navegador conversa apenas com o `web`; as chamadas ao gateway partem do servidor Next.js (Server Components e Server Actions).

### 4.1 Topologia de Eventos (RabbitMQ)

Exchange única **`mio.events`** do tipo **topic**. Cada consumidor declara sua própria fila, com fila de dead-letter `<fila>.dead`.

| Routing key | Publicado por | Fila | Consumido por |
| :--- | :--- | :--- | :--- |
| `lesson.completed` | `api-core` | `gamification.lesson.completed` | `api-gamification` |
| `lesson.completed` | `api-core` | `achievements.lesson.completed` | `api-achievements` |
| `xp.rewarded` | `api-gamification` | `achievements.xp.rewarded` | `api-achievements` |
| `achievement.unlocked` | `api-achievements` | `gamification.achievement.unlocked` | `api-gamification` |
| `user.registered` | `api-core` | `notifications.user.registered` | `api-notifications` |
| `user.password_reset_requested` | `api-core` | `notifications.user.password_reset_requested` | `api-notifications` |

**Transactional Outbox:** os publicadores gravam o evento na tabela de outbox do próprio banco, na mesma transação da mudança de estado. Um poller em cada serviço (`OUTBOX_POLL_INTERVAL_MS`, padrão 30s) publica os pendentes no RabbitMQ. Se o broker estiver fora do ar, os eventos ficam retidos no Postgres e são publicados quando ele voltar.

**Consumidores** reconectam automaticamente ao broker, fazem retry com limite de tentativas e encaminham mensagens esgotadas ou malformadas para a DLQ.

> Consumidores e pollers de outbox são processos de longa duração: os containers precisam permanecer **sempre ativos** para que o fluxo de eventos avance.

---

## 5. Configuração

Cada app lê seu próprio `.env`, referenciado via `env_file` no Compose:

| Arquivo | Consumido por |
| :--- | :--- |
| `apps/api/.env` | Os 6 containers da API e os containers de infraestrutura (Postgres, RabbitMQ) |
| `apps/web/.env` | `web` |

Modelos de desenvolvimento em `apps/api/.env.example` e `apps/web/.env.example`; modelos de deploy em `.env.production.example` nos diretórios de cada app.

### 5.1 Variáveis — API

| Grupo | Variáveis |
| :--- | :--- |
| Postgres (por serviço) | `CORE_POSTGRES_{USER,PASSWORD,DB}`, `GAMIFICATION_POSTGRES_*`, `ACHIEVEMENTS_POSTGRES_*`, `*_DATABASE_URL` |
| Redis | `REDIS_URL` |
| RabbitMQ | `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`, `RABBITMQ_URL`, `OUTBOX_POLL_INTERVAL_MS` |
| Portas | `GATEWAY_PORT`, `CORE_GRPC_PORT` … `NOTIFICATIONS_GRPC_PORT` |
| Timeouts gRPC | `GATEWAY_GRPC_TIMEOUT_MS`, `CORE_GRPC_TIMEOUT_MS`, `GAMIFICATION_GRPC_TIMEOUT_MS` |
| Auth | `JWT_SECRET`, `JWT_ISSUER`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `INTERNAL_API_SECRET` |
| E-mail | `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `APP_URL` |

### 5.2 Variáveis — Web

| Grupo | Variáveis |
| :--- | :--- |
| Auth | `AUTH_SECRET`, `AUTH_URL`, `INTERNAL_API_SECRET` |
| OAuth | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` |
| API | `GATEWAY_GRAPHQL_URL` |

`INTERNAL_API_SECRET` deve ter **o mesmo valor** em `apps/api/.env` e `apps/web/.env`. O gateway recusa iniciar se ela estiver vazia, e o Compose também falha (`${INTERNAL_API_SECRET:?...}`).

### 5.3 Segredos

Em deploy, todos os valores de desenvolvimento (`mio/mio`, `dev-*-change-in-production`) devem ser substituídos. Gere segredos URL-safe com:

```bash
openssl rand -hex 32
```

Segredos obrigatórios: `JWT_SECRET`, `INTERNAL_API_SECRET`, `AUTH_SECRET`, senhas dos 3 Postgres e do RabbitMQ.

---

## 6. Operação

Todos os comandos rodam na raiz do repositório. O `docker-compose.yml` da raiz inclui `apps/api/docker-compose.yml` e `apps/web/docker-compose.yml`. O Compose publica o frontend somente em `127.0.0.1:3000`; o acesso externo passa pelo Nginx nas portas 80/443.

```bash
yarn docker:build        # docker compose build  → gera mio-api e mio-web
yarn docker:up           # docker compose up
yarn docker:up:build     # build + up (foreground)
yarn docker:down         # derruba os containers (volumes são preservados)
```

Para deixar a stack rodando em background no servidor:

```bash
docker compose --parallel 1 up --build -d
docker compose ps
docker compose logs -f web api-gateway
```

O caminho recomendado valida os dois arquivos `.env`, rejeita valores `CHANGE_ME` e verifica que o segredo interno coincide antes de subir a stack:

```bash
bash scripts/deploy.sh
```

### Pipeline com GHCR e VM Oracle

O repositório também contém um fluxo alternativo para construir as imagens no GitHub Actions, publicá-las no GitHub Container Registry (GHCR) e atualizar a VM sem fazer build nela:

1. O workflow `CI` executa as verificações da API e do frontend em pushes relevantes para `main` e em pull requests. Só quando o CI de um commit em `main` termina com sucesso, `Publish container images` constrói e publica `mio-api` e `mio-web` com o SHA desse commit. A imagem da API também compila os scripts operacionais para `dist`. As imagens incluem `linux/amd64` e `linux/arm64`.
2. `Deploy to VM` é acionado manualmente em GitHub → Actions. Informe a tag SHA publicada e selecione o GitHub Environment de destino; o workflow envia os arquivos Compose e `scripts/` para `/opt/mio`, baixa as imagens e executa Compose com `--no-build`. O serviço `api-migrate` aplica migrations pendentes antes da atualização dos serviços da API. O workflow usa nomes de configuração independentes do provedor; hoje o destino é a VM Oracle.

Antes de usar o workflow, a VM deve ter Docker Engine/Compose, as pastas `/opt/mio/apps/api` e `/opt/mio/apps/web` graváveis pelo usuário SSH, os arquivos `apps/api/.env` e `apps/web/.env` criados em `/opt/mio` e a chave SSH pública do workflow autorizada. O usuário SSH precisa executar Docker sem prompt interativo. Crie esses `.env` a partir dos exemplos locais e transfira-os por um canal seguro; eles não são enviados pelo workflow nem devem ser commitados. Não é necessário clonar o código da aplicação na VM. Após um deploy bem-sucedido, `scripts/deploy-registry.sh` grava `TAG` e `GHCR_NAMESPACE` no `.env` da raiz para os comandos operacionais usarem a mesma versão e o mesmo namespace de imagens.

Crie um GitHub Environment chamado `PROD` em Settings → Environments e configure nele os **Environment secrets** abaixo. O job de deploy referencia o Environment selecionado no formulário de execução, por isso esses secrets só ficam disponíveis para o destino escolhido. Ao adicionar outro destino, crie outro Environment (por exemplo, `STAGING`) e cadastre nele os mesmos nomes de secrets com os valores daquele servidor. Assim, uma mesma tag de imagem pode ser promovida entre ambientes; selecione o ambiente desejado em GitHub → Actions → `Deploy to VM`:

| Secret | Conteúdo |
| :--- | :--- |
| `DEPLOY_HOST` | IP ou hostname público do servidor |
| `DEPLOY_USER` | Usuário Linux usado para SSH (na VM Oracle atual, `ubuntu`) |
| `DEPLOY_SSH_PRIVATE_KEY` | Chave privada dedicada ao workflow; a chave pública correspondente deve estar autorizada no servidor |
| `DEPLOY_KNOWN_HOSTS` | Linha `known_hosts` do servidor, obtida e verificada por um canal confiável |
| `GHCR_READ_TOKEN` | Personal access token clássico com `read:packages` para baixar imagens privadas; deve ter acesso aos pacotes do owner do repositório |

Os nomes são independentes do provedor. O namespace e o usuário de login do GHCR são derivados automaticamente do owner do repositório, sem username fixo no workflow; o namespace é salvo no `.env` operacional da VM durante o deploy. Para migrar da Oracle para outro host, atualize os valores no Environment correspondente; para manter Oracle e outro host ao mesmo tempo, crie um segundo Environment com as próprias credenciais. Se configurar aprovação ou outras regras de proteção no Environment do GitHub, elas serão aplicadas antes que o job receba seus secrets.

O login GHCR no workflow é feito apenas durante o deploy; o token não deve ser colocado nos arquivos `.env`. A publicação usa o `GITHUB_TOKEN` da própria Actions com permissão `packages: write`. A tag do commit deve ter 40 caracteres hexadecimais e corresponder a uma execução bem-sucedida de `Publish container images`.

O runner do GitHub seleciona os manifests do mesmo commit das imagens e os envia à VM; **o código da aplicação não é clonado nem construído na VM**. Os containers vêm das imagens do GHCR. Os arquivos `.env` e volumes Docker permanecem no servidor durante os deploys e devem ser tratados como configuração e dados do ambiente.

O deploy requer um host com Docker Compose 2.24+, suporte à arquitetura da imagem e armazenamento persistente para os volumes. O build local gera a arquitetura do host; o pipeline GHCR publica manifests para AMD64 e ARM64.

### 6.1 Preparar ambiente de teste

Os exemplos de produção ficam em `apps/api/.env.production.example` e `apps/web/.env.production.example`. No host, copie-os para os arquivos `.env` que o Compose lê:

```bash
cp apps/api/.env.production.example apps/api/.env
cp apps/web/.env.production.example apps/web/.env
```

Substitua todos os valores `CHANGE_ME`. Gere segredos hexadecimais — seguros para uso nas URLs dos bancos — com `openssl rand -hex 32`. Use valores diferentes para cada senha de Postgres, RabbitMQ, `JWT_SECRET` e `AUTH_SECRET`; configure `INTERNAL_API_SECRET` com o mesmo valor nos dois arquivos. Defina `AUTH_URL` e `APP_URL` como `https://<IP-PUBLICO>` (ou o domínio, quando houver). Os arquivos `.env` contêm segredos, ficam fora do contexto de build Docker e não devem ser commitados.

O acesso público passa pelo Nginx em `https://<IP-PUBLICO>`; a porta 3000 fica somente no loopback. Login por Google/GitHub depende de URLs de callback públicas e cadastradas nos respectivos provedores; e-mail de recuperação depende de SMTP real. Sem essas configurações, mantenha esses fluxos fora do teste.

O frontend é publicado pelo Compose somente em `127.0.0.1:3000`; não crie regra de entrada para a porta 3000 na OCI nem no firewall do host. O Nginx instalado no host é a única entrada web: permita TCP 80 e 443 na rede da OCI e no firewall do sistema. Primeiro instale [`infra/nginx/mio-http.conf`](../infra/nginx/mio-http.conf) para servir HTTP e permitir o desafio ACME. Depois que o certificado estiver emitido, troque pela configuração final [`infra/nginx/mio.conf`](../infra/nginx/mio.conf), que encaminha HTTPS para `127.0.0.1:3000` e redireciona HTTP para HTTPS.

Sem domínio, o certificado precisa ser emitido para um IP público estável; certificados IP do Let's Encrypt têm validade de 160 horas e exigem renovação automática. O Certbot 5.4+ suporta solicitação por webroot usando o perfil `shortlived`; a instalação no Nginx é manual. A configuração versionada `infra/nginx/mio.conf` usa caminhos estáveis (`/etc/nginx/tls/mio/fullchain.pem` e `privkey.pem`) sem fixar o IP nem o caminho específico do Certbot. No host, crie esses caminhos como links simbólicos para os arquivos `fullchain.pem` e `privkey.pem` da linhagem Certbot emitida para aquele IP. Assim, o caminho específico do certificado fica apenas na VM. Preserve o bloco `/.well-known/acme-challenge/` na porta 80 para permitir as renovações. Valide com `sudo nginx -t` e recarregue com `sudo systemctl reload nginx`. Configure um deploy hook do Certbot para recarregar o Nginx após uma renovação bem-sucedida e teste com `sudo certbot renew --dry-run --run-deploy-hooks`.

`docker compose --parallel 1 up --build -d` executa `api-migrate` depois que os três Postgres passam no healthcheck e só inicia o gateway após as migrations concluírem. O serviço executa o script `prisma:migrate:deploy` do `apps/api/package.json` usando a imagem da API. Para aplicar migrations manualmente na VM com a versão implantada, use `./scripts/ops/migrate.sh`.

Os scripts de dados iniciais ficam na própria API (`apps/api/apps/*/scripts`) e são compilados para `dist` durante o build da imagem. Os comandos `seed:all` e `seed:*` do `apps/api/package.json` executam essa versão compilada. Eles não rodam automaticamente durante o deploy. Na VM, execute `./scripts/ops/seed.sh seed:all`; o wrapper pede confirmação e inicia um container temporário `api-ops` usando a imagem implantada e a rede privada do Compose. Para uma operação não destrutiva, o runner genérico é `./scripts/ops/run.sh <script-do-package.json> [argumentos...]`. O seed inclui usuários de demonstração e atualiza o administrador; use somente em banco de teste.

Para adicionar uma nova operação TypeScript, crie o comando no `apps/api/package.json`, compile seu entrypoint em `apps/api/tsconfig.ops.json` para `dist` e deixe a lógica no código da API. O `build:ops` compila esses entrypoints no CI e no build da imagem; o runner genérico apenas seleciona o nome do script e encaminha os argumentos.

Ao definir `DEV_ADMIN_PASSWORD_HASH` nos arquivos `.env`, coloque o hash Argon2 entre aspas simples: os caracteres `$` são interpretados pelo Compose durante a interpolação.

Para editar as variáveis na própria VM e recriar os containers com a versão já implantada, use `./scripts/ops/env.sh api`, `./scripts/ops/env.sh web` ou `./scripts/ops/env.sh both`. O script abre os arquivos correspondentes no `nano`, verifica a configuração e recria somente os serviços escolhidos, sem baixar imagens. A VM precisa ter `nano` instalado. `apps/api/.env` é compartilhado pelos serviços da API; `apps/web/.env` é usado pelo frontend. Alterações em `INTERNAL_API_SECRET` exigem o modo `both`, pois o valor deve ser igual nos dois arquivos.

Alterar `*_POSTGRES_PASSWORD` no `.env` não troca a senha que já está gravada em um volume PostgreSQL existente; a credencial também precisa ser alterada no banco. Trate mudanças de senha do Postgres ou RabbitMQ como rotação de credenciais, não apenas como edição de variável.

### 6.2 Migrations

Cada serviço com banco possui seu schema Prisma em `apps/api/apps/<servico>/prisma/`. A imagem `mio-api` inclui schemas e migrations; o serviço one-shot `api-migrate` aplica os três schemas antes do gateway. Para executar manualmente a versão atualmente implantada:

```bash
./scripts/ops/migrate.sh
```

As migrations são executadas antes de iniciar as APIs em cada deploy que recria o job.

### 6.3 Ordem de inicialização

```
postgres-* (healthy) · redis (healthy) · rabbitmq (healthy)
        │
        ▼
    api-migrate
        │
        ▼
api-core · api-gamification · api-achievements · api-messenger · api-notifications · api-gateway
        │
        ▼
api-gateway ready → web
```

Compose aguarda healthchecks de Postgres, Redis e RabbitMQ. O gateway é considerado saudável quando o endpoint `/health/ready` confirma os serviços gRPC. Os processos de longa duração usam `restart: unless-stopped`; migrations são um job sem política de reinício e precisam terminar com sucesso.

### 6.4 Persistência e Backup

| Volume | Conteúdo | Criticidade |
| :--- | :--- | :--- |
| `postgres-core-data` | Usuários, catálogo, progresso, outbox | Alta |
| `postgres-gamification-data` | XP, níveis, streaks, outbox | Alta |
| `postgres-achievements-data` | Conquistas, outbox | Alta |
| `rabbitmq-data` | Filas duráveis e mensagens pendentes | Média |
| `redis-data` | Leaderboard, sessões, jobs de e-mail | Média (leaderboard reconstruível a partir do Postgres) |

Backup lógico de um banco:

```bash
docker compose exec postgres-core pg_dump -U "$CORE_POSTGRES_USER" "$CORE_POSTGRES_DB" > core.sql
```

`docker compose down` preserva os volumes; `docker compose down -v` **apaga todos os dados**.

### 6.5 Logs e Diagnóstico

```bash
docker compose ps                         # estado dos containers
docker compose logs -f api-gamification   # logs de um serviço
docker compose exec api-gateway node -e "fetch('http://127.0.0.1:3333/health/ready').then(r => process.exit(r.ok ? 0 : 1))"
```

O gateway não publica sua porta no host. O painel RabbitMQ (`:15672`) também fica interno; use acesso SSH com encaminhamento de porta se precisar inspecioná-lo.

---

## 7. Dimensionamento

Estimativa de consumo em repouso/carga baixa:

| Componente | Instâncias | RAM aproximada |
| :--- | :--- | :--- |
| Serviços NestJS | 6 | ~150–250 MB cada |
| Next.js | 1 | ~200–300 MB |
| Postgres | 3 | ~100–200 MB cada |
| RabbitMQ | 1 | ~150–250 MB |
| Redis | 1 | ~20–50 MB |
| **Total** | **12** | **~2,5–4 GB** |

Uma VM com **2+ vCPUs e 4+ GB de RAM** comporta a stack em carga baixa. A cota Always Free atual de A1 (2 OCPUs/12 GB) tem memória suficiente para a estimativa de runtime, mas o build simultâneo com a stack pode aumentar o pico de memória. Em hosts menores, construa as imagens antes de iniciar os containers ou use um runner/CI compatível. Imagens base, Prisma e `@node-rs/argon2` têm suporte a `amd64` e `arm64`; o build local usa a arquitetura do host.

---

## 8. Estado Atual e Lacunas para Produção

O perfil padrão usa boas configurações para teste remoto. Ainda faltam itens para operação de produção com usuários reais:

| Item | Situação atual | Necessário |
| :--- | :--- | :--- |
| Portas publicadas | O perfil padrão publica `web` somente em `127.0.0.1:3000`; gateway e dados ficam na rede interna | Abrir somente 80/443 para web e restringir SSH |
| Migrations | Job `api-migrate` executa migrations antes do gateway e da web API | Operador deve revisar a migration antes de atualizar um banco com dados importantes |
| Dados iniciais | Scripts compilados da API em `api-ops`; não fazem parte do deploy automático | Executar manualmente por `scripts/ops/seed.sh`, somente em banco de teste |
| Healthchecks | Adicionados a Postgres, Redis, RabbitMQ e gateway | Observar estado `healthy` e logs após cada deploy |
| Limites de recursos | Sem limites rígidos por container | Dimensionar a VM para a stack e monitorar memória; build local consome memória adicional |
| TLS | Nginx termina TLS em 443 e encaminha para `127.0.0.1:3000`; config em `infra/nginx/mio.conf` | Instalar certificado válido e automatizar renovação; certificado Let's Encrypt para IP é curto |
| SMTP | O exemplo de produção não inclui servidor de e-mail | `SMTP_*` apontando para um servidor real antes de habilitar e-mail |
| Messenger (SSE) | Container sobe apenas com health gRPC; streaming ainda não implementado | — |
