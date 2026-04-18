# Mio API

Plataforma gamificada de ensino de programacao. Arquitetura de microservicos totalmente gerenciada pelo NestJS — o proprio framework controla o gateway, os microservicos, o transporte (gRPC, RabbitMQ) e a orquestracao entre eles.

## Stack

- **Framework:** NestJS 11 — usado tanto no API Gateway quanto em todos os microservicos
- **Linguagem:** TypeScript 5.9 (strict mode)
- **Runtime:** Node.js 24+
- **Package Manager:** Yarn 1.22
- **Monorepo:** Turbo (root em `../../`)
- **Linter/Formatter:** Biome (nao usa ESLint/Prettier)
- **Testes:** Vitest + Supertest + @nestjs/testing
- **Docker:** Multi-stage build, porta 3333

## Comandos

```bash
yarn dev              # nest start --watch
yarn build            # nest build
yarn lint             # biome lint
yarn format           # biome format
yarn check-types      # tsc --noEmit
yarn test             # vitest run (todos)
yarn test:unit        # vitest tests/unit
yarn test:e2e         # vitest tests/e2e
yarn test:cov         # coverage com v8
```

## Estrutura de Testes

- `tests/unit/` — testes unitarios (`*.test.ts`)
- `tests/e2e/` — testes end-to-end (`*.test.ts`)
- `tests/integration/` — testes de integracao (placeholder)
- Configs separadas: `vitest.unit.config.ts`, `vitest.e2e.config.ts`
- SWC para compilacao rapida nos testes

## Convencoes

- Commits seguem **Conventional Commits** (feat, fix, docs, refactor, test, chore, etc.)
- Subject em lowercase
- Pre-commit hooks via Husky: lint-staged roda biome check, type check e testes unitarios
- TypeScript config herdada de `@mio/typescript-config/nestjs`
- Modulo CommonJS (necessario para NestJS), target ES2024
- Decorators habilitados (emitDecoratorMetadata)

## Arquitetura

Documentacao completa em `docs/ARCHITECTURE.md`.

Todos os servicos sao apps NestJS. O framework gerencia o ciclo de vida, transporte e comunicacao entre eles nativamente (`@nestjs/microservices`).

- **API Gateway** (NestJS) — stateless, roteia via gRPC para microservicos
- **Servico de Catalogo e Ensino (Core)** (NestJS) — PostgreSQL, publica `lesson.completed`
- **Servico de Gamificacao** (NestJS) — PostgreSQL + Redis Sorted Sets, escuta `lesson.completed`, publica `xp.rewarded`
- **Servico de Conquistas** (NestJS) — escuta `lesson.completed` e `xp.rewarded`, publica `achievement.unlocked`
- **Servico de Comunicacao (Messenger)** (NestJS) — SSE para real-time, Redis Pub/Sub entre instancias
- **Servico de Notificacoes** (NestJS) — BullMQ (Redis) para emails e jobs

### Protocolos

- Client <-> Gateway: HTTPS / GraphQL
- Gateway <-> Servicos: gRPC
- Servico <-> Message Broker: AMQP (RabbitMQ)
- Messenger -> Client: SSE
- Inter-instancias: Redis Pub/Sub

## CI/CD

- GitHub Actions em `.github/workflows/ci-api.yml`
- Trigger: push para main ou PRs que alterem `apps/api/**`, `packages/**`
- Pipeline: install -> lint -> type check -> tests
