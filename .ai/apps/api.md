---
globs: apps/api/**/*
---

# Mio API

Plataforma gamificada de ensino de programação. Arquitetura de microserviços totalmente gerenciada pelo NestJS — o próprio framework controla o gateway, os microserviços, o transporte (gRPC, RabbitMQ) e a orquestração entre eles.

## Stack

- **Framework:** NestJS 11 — usado tanto no API Gateway quanto em todos os microserviços
- **Linguagem:** TypeScript 5.9 (strict mode)
- **Runtime:** Node.js 24+
- **Package Manager:** Yarn 1.22
- **Monorepo:** Turbo (root em `../../`)
- **Linter/Formatter:** Biome (não usa ESLint/Prettier)
- **Testes:** Vitest + Supertest + @nestjs/testing
- **ORM:** Prisma (PostgreSQL)
- **Docker:** Multi-stage build, porta 3333

## Comandos

```bash
yarn dev                          # Inicia a infra local e todos os microserviços no Docker
yarn build                        # Compila todos os microserviços
yarn lint                         # Validação do Biome
yarn format                       # Formatação automática do Biome
yarn check-types                  # Typecheck do TypeScript (tsc)
yarn test                         # Vitest run (todos os testes)
yarn test:unit                    # Vitest rodando unitários (tests/unit)
yarn test:e2e                     # Vitest rodando e2e (tests/e2e)
yarn test:cov                     # Cobertura de testes
yarn build:contracts              # Compila os contratos gRPC compartilhados

# Banco de Dados & Prisma (Executados no Host)
yarn prisma:generate              # Gera os clients Prisma de todos os serviços com BD
yarn prisma:migrate:dev           # Cria e aplica migrações de dev em todos os serviços
yarn prisma:migrate:deploy        # Executa migrações pendentes em produção
yarn prisma:studio:core           # Inicia Prisma Studio do Core (porta 5555)
yarn prisma:studio:gamification   # Inicia Prisma Studio do Gamification (porta 5556)
yarn prisma:studio:achievements   # Inicia Prisma Studio do Achievements (porta 5557)
yarn seed:content                 # Roda script de seed de conteúdo (Host)

# Banco de Dados & Prisma (Executados dentro do Docker Compose)
yarn docker:prisma:migrate:dev    # Roda prisma:migrate:dev dentro do container api-core
yarn docker:prisma:migrate:deploy # Roda prisma:migrate:deploy dentro do container api-core
yarn docker:seed:content          # Roda seed:content dentro do container api-core
```

## Banco de Dados & Prisma (Multi-Schema)

A API gerencia múltiplos bancos de dados PostgreSQL utilizando o Prisma. Cada serviço que possui persistência gerencia seu próprio schema:
- **Core**: `apps/core/prisma/schema.prisma`
- **Gamification**: `apps/gamification/prisma/schema.prisma`
- **Achievements**: `apps/achievements/prisma/schema.prisma`

Os comandos Prisma padrão foram envelopados no `package.json` para iterar sobre todas as subpastas automaticamente. Sempre utilize os scripts globais (como `yarn prisma:generate` ou `yarn docker:prisma:migrate:dev`) para garantir que todos os bancos estejam sincronizados.

## Estrutura de Testes

- `tests/unit/` — testes unitários (`*.test.ts`)
- `tests/e2e/` — testes end-to-end (`*.test.ts`)
- Configurações dedicadas: `vitest.unit.config.ts`, `vitest.e2e.config.ts`
- Utiliza SWC para compilação super rápida nos testes.

## Convenções

- Commits seguem **Conventional Commits** (feat, fix, docs, refactor, test, chore, etc.)
- Subject em lowercase.
- Pre-commit hooks via Husky: lint-staged roda biome check, type check e testes unitários.
- TypeScript config herdada de `@mio/typescript-config/nestjs`.
- Módulo CommonJS (necessário para NestJS), target ES2024.
- Decorators habilitados (`emitDecoratorMetadata`).

## Arquitetura

Documentação completa em `docs/ARCHITECTURE.md`.

Todos os serviços são apps NestJS. O framework gerencia o ciclo de vida, transporte e comunicação entre eles nativamente (`@nestjs/microservices`).

- **API Gateway** (NestJS) — stateless, roteia via gRPC para microserviços.
- **Serviço de Catálogo e Ensino (Core)** (NestJS) — PostgreSQL, publica `lesson.completed`.
- **Serviço de Gamificação** (NestJS) — PostgreSQL + Redis Sorted Sets, escuta `lesson.completed`, publica `xp.rewarded`.
- **Serviço de Conquistas** (NestJS) — escuta `lesson.completed` e `xp.rewarded`, publica `achievement.unlocked`.
- **Serviço de Comunicação (Messenger)** (NestJS) — SSE para real-time, Redis Pub/Sub entre instâncias.
- **Serviço de Notificações** (NestJS) — BullMQ (Redis) para e-mails e jobs.

### Protocolos

- Client <-> Gateway: HTTPS / GraphQL
- Gateway <-> Serviços: gRPC (contratos compilados em `@mio/grpc-contracts`)
- Serviço <-> Message Broker: AMQP (RabbitMQ)
- Messenger -> Client: SSE
- Inter-instâncias: Redis Pub/Sub

## CI/CD

- GitHub Actions em `.github/workflows/ci-api.yml`
- Trigger: push para main ou PRs que alterem `apps/api/**`, `packages/**`
- Pipeline: install -> lint -> type check -> tests
