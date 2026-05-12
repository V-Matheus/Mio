# 00 — Foundations

Base técnica compartilhada por todas as features. Nada de regra de negócio aqui — apenas o que cada serviço precisa **para conseguir falar com os outros**.

## Status atual

### Monorepo & runtime
- ✅ Turbo workspace (`apps/api`, `apps/web`, `packages/*`).
- ✅ Node 24, Yarn 1.22, TypeScript 5.9 strict.
- ✅ Biome substituindo ESLint/Prettier.
- ✅ Husky + lint-staged (biome check + type check + testes unitários).
- ✅ Commitlint + Conventional Commits.

### Backend infra
- ✅ 6 apps NestJS provisionados: `gateway`, `core`, `gamification`, `achievements`, `messenger`, `notifications` (`apps/api/apps/`).
- ✅ `docker-compose.yml` com Postgres x3, Redis, RabbitMQ e os 6 serviços.
- ✅ Health checks: gRPC `Health.Check` (`apps/api/proto/health.proto`) e endpoints `/health/live` + `/health/ready` no gateway.
- ✅ Prisma schemas para `core`, `gamification`, `achievements` com bancos isolados.
- ⏳ gRPC: hoje só carrega o `health.proto`. Não há `.proto` por domínio.
- ❌ GraphQL: gateway é REST puro, sem `@nestjs/graphql` instalado.
- ❌ AMQP/RabbitMQ: serviço está no compose, mas **nenhum app NestJS está conectado** ao broker.
- ❌ Redis: instância está no compose, mas **nenhum app conectado**.

### Frontend infra
- ✅ Next.js 16 (App Router), React 19, Tailwind v4 com tokens em `app/globals.css`.
- ✅ Storybook 10 (`@storybook/nextjs-vite`) com a11y e docs.
- ✅ Vitest separado em `unit`, `integration`, `e2e`.
- ✅ Proxy (`apps/web/proxy.ts`) com gating de rotas autenticadas.
- ❌ Cliente GraphQL no servidor (urql/graphql-request/codegen). Web ainda chama um `authService` stub.

### CI/CD
- ✅ `.github/workflows/ci-web.yml` e `ci-api.yml` rodando `install → lint → type-check → tests` em push/PR que toquem o respectivo diretório.
- ❌ Pipeline de **build de imagens Docker** e de **deploy**.
- ❌ Job de **migrations Prisma** automatizado.

### Observabilidade
- ❌ Logger estruturado (Pino/Winston) padronizado.
- ❌ Captura de exceções (Sentry ou equivalente self-hosted) — citado no ARCHITECTURE.md mas não integrado.
- ❌ Métricas (`/metrics` Prometheus) e tracing (OpenTelemetry).
- ❌ Healthcheck de Redis e RabbitMQ no gateway (`/health/ready` cobre só gRPC dos serviços de dados).

## Escopo

1. Habilitar **GraphQL no gateway** (resolvers stub + schema federado por domínio).
2. Definir **contratos gRPC por domínio** (`.proto`) e fazer o gateway chamar via `ClientGrpc`.
3. Conectar todos os serviços ao **RabbitMQ** (publisher/subscriber base) e definir o catálogo de eventos.
4. Conectar `gamification` e `messenger` ao **Redis** (sorted sets + pub/sub respectivamente).
5. Padronizar **observabilidade mínima** (logger + exception filter + request id).
6. Estender CI com **build de imagens** e **migrations**.

## Contratos

### Catálogo de eventos (AMQP — RabbitMQ topic exchange `mio.events`)

| Evento | Routing key | Producer | Consumers | Payload |
|---|---|---|---|---|
| `lesson.completed` | `lesson.completed` | Core | Gamification, Achievements | `{ userCode, lessonId, trackId, completedAt }` |
| `xp.rewarded` | `xp.rewarded` | Gamification | Achievements, Messenger | `{ userCode, amount, reason, totalAfter, awardedAt }` |
| `achievement.unlocked` | `achievement.unlocked` | Achievements | Messenger, Notifications | `{ userCode, achievementSlug, unlockedAt }` |
| `user.registered` | `user.registered` | Core | Notifications | `{ userCode, email, name, registeredAt }` |
| `user.password_reset_requested` | `user.password_reset_requested` | Core | Notifications | `{ userCode, email, resetToken, expiresAt }` |

Convenção: cada consumer tem sua própria fila durável bound à routing key. Mensagens em JSON, `contentType: application/json`, com cabeçalho `x-event-version`.

### Logger padrão

- Biblioteca: **Pino** (rápido, JSON nativo).
- Campos obrigatórios: `service`, `requestId`, `userCode?`, `traceId?`, `level`, `time`, `msg`.
- Cada serviço expõe um `LoggerModule` global que injeta um `LoggerService`.

### Health avançado (gateway `/health/ready`)

Estender para incluir:
- Ping Redis (`PING`).
- Ping RabbitMQ (verifica `connection.isConnected`).
- Os pings gRPC existentes para `core`, `gamification`, `achievements`, **e adicionar** `messenger`, `notifications`.

## Tarefas

### GraphQL no gateway
- [ ] Adicionar dependências: `@nestjs/graphql`, `@nestjs/apollo`, `@apollo/server`, `graphql`.
- [ ] Configurar `GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true, playground: false, introspection: process.env.NODE_ENV !== 'production' })`.
- [ ] Estrutura `apps/gateway/src/modules/<domain>/<domain>.resolver.ts` para cada domínio.
- [ ] Context com `req` e `userCode` (após auth — ver spec 01).

### Contratos gRPC por domínio
- [ ] Criar `apps/api/proto/users.proto`, `tracks.proto`, `lessons.proto`, `progress.proto`, `gamification.proto`, `achievements.proto`, `messenger.proto`.
- [ ] Adicionar registros gRPC server nos respectivos microserviços.
- [ ] Registrar `ClientsModule` no gateway com pacote correto para cada serviço.

### RabbitMQ wiring
- [ ] Criar `packages/event-bus` (ou módulo compartilhado em `apps/api/libs/event-bus`) com `EventBusModule.forRoot({ url })` baseado em `amqplib`.
- [ ] Helpers: `publish(event, payload)` e `@OnEvent('routing.key')` decorator.
- [ ] Aplicar no `core.module.ts`, `gamification.module.ts`, `achievements.module.ts`, `messenger.module.ts`, `notifications.module.ts`.

### Redis wiring
- [ ] Adicionar `ioredis` aos serviços que precisarem.
- [ ] `RedisModule.forRoot({ host, port })` global em `gamification` (sorted sets) e `messenger` (pub/sub).

### Cliente GraphQL no Web
- [ ] Adicionar `graphql-request` (lightweight, server-friendly) + `@graphql-codegen/cli` para gerar tipos a partir do schema do gateway.
- [ ] `apps/web/lib/gql/client.ts` com função `gqlServer()` que injeta headers de auth (cookie/JWT).
- [ ] Script `yarn codegen` que aponta para `http://localhost:3333/graphql` (ou snapshot em CI).
- [ ] `.gitignore` para tipos gerados sob `apps/web/lib/gql/generated/`.

### Observabilidade
- [ ] Instalar `nestjs-pino` em todos os serviços + interceptor de request id.
- [ ] `ExceptionFilter` global que registra com stack + `requestId`.
- [ ] Endpoint `/metrics` no gateway (`prom-client`).
- [ ] Sentry SDK opcional configurado via env (`SENTRY_DSN`).

### CI/CD extensões
- [ ] Job `docker-build` no `ci-api.yml` que faz `docker build` por serviço (matriz) usando `apps/api/Dockerfile`.
- [ ] Job `prisma-migrate` que roda `prisma migrate deploy` em ambiente de staging.
- [ ] Cache de `node_modules` e `.next` no CI.

## Critérios de aceite

- `yarn dev` no `apps/api` sobe todos os 6 serviços + Postgres x3 + Redis + RabbitMQ, e `/health/ready` retorna 200 com **6 checks verdes** (gRPC de 5 serviços + Redis + RabbitMQ).
- `POST /graphql` no gateway aceita uma query stub do tipo `query { ping }` e retorna `"pong"`.
- Publicar um evento manual `mio.events / lesson.completed` no RabbitMQ Management aparece no log estruturado dos serviços `gamification` e `achievements`.
- `yarn codegen` no Web gera tipos a partir do schema do gateway sem erros.

## Riscos & decisões em aberto

- **Federation vs schema único** no GraphQL: começar com schema único monolítico no gateway. Federation só se a complexidade crescer.
- **Codegen vs hand-written types** no Web: codegen ganha à medida que o schema cresce; só evitar se o time não tiver afinidade.
- **Logger lib**: alternativa ao Pino seria `nestjs-winston`. Pino é mais rápido e tem melhor formato JSON.
