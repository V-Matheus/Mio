# Mio Web

Frontend da plataforma gamificada de ensino de programacao. Next.js 16 (App Router) server-first, consumindo o API Gateway NestJS via GraphQL. Real-time via SSE do Messenger.

## Stack

- **Framework:** Next.js 16.2 (App Router, React Server Components)
- **UI:** React 19
- **Linguagem:** TypeScript 5.9 (strict mode)
- **Styling:** Tailwind CSS v4 (tokens via `@theme` em `globals.css`)
- **Icones:** Iconify (`@iconify/react`)
- **Fontes:** `next/font/google` — Outfit (display) + Plus Jakarta Sans (body)
- **Storybook:** `@storybook/nextjs-vite` com addons `a11y`, `docs`, `chromatic`
- **Runtime:** Node.js 24+
- **Package Manager:** Yarn 1.22
- **Monorepo:** Turbo (root em `../../`)
- **Linter/Formatter:** Biome (nao usa ESLint/Prettier)
- **Testes:** Vitest + Testing Library
- **Docker:** porta 3000

## Comandos

```bash
yarn dev              # next dev --port 3000
yarn build            # next build
yarn start            # next start
yarn lint             # biome lint
yarn format           # biome format --write
yarn check-types      # next typegen && tsc --noEmit
yarn test             # vitest run (todos)
yarn test:unit        # vitest tests/unit
yarn test:e2e         # vitest tests/e2e
yarn test:cov         # coverage
yarn storybook        # storybook dev -p 6006
yarn build-storybook  # build estatico do storybook
```

## Estrutura

- `app/` — App Router
  - `layout.tsx` — RootLayout (fontes, `<html>`, `<body>`)
  - `globals.css` — tokens de design via `@theme` do Tailwind v4
  - `components/` — design system (button, card, gamification)
  - `(portal)/` — route group da landing; `_components/` sao privados da rota
- `stories/` — Storybook espelhando `app/components/`
- `tests/unit`, `tests/integration`, `tests/e2e` — Vitest

## Convencoes

- **Server Components por padrao.** Use Client Components (`"use client"`) somente quando precisar de estado/efeitos/eventos do browser.
- **Compound components** para o design system: `Wrapper` + pecas (`Text`, `Icon`, `Title`, etc.), exportados via barrel `index.ts`.
- **Route groups** `(nome)` para organizar sem afetar URL; **private folders** `_nome` para esconder arquivos que nao devem virar rota.
- **Mutacoes sensiveis** devem passar por Server Actions — nunca chamar o Gateway direto do browser.
- **Server Actions vivem por dominio em `lib/<dominio>/actions/`** (ex.: `lib/auth/actions/`), nao em `_actions/` dentro de route groups. Motivo: route groups como `(app)` abrangem o app inteiro e viram "dumping ground". Cada dominio agrupa `actions/` + `service.ts` + `schemas/` + `types/` + `graphql/`. Componentes importam via barrel `@/lib/<dominio>/actions`. Acoes ficam finas (parse FormData -> Zod schema -> service -> FormState/redirect); logica de dominio fica no `service.ts`. Testes espelham em `tests/unit/lib/<dominio>/actions/`.
- **Tokens de design** vivem em `globals.css` sob `@theme`; nao hardcode cores/fontes nos componentes.
- Commits seguem **Conventional Commits** (feat, fix, docs, refactor, test, chore, etc.), subject em lowercase.
- Pre-commit hooks via Husky: lint-staged roda biome check, type check e testes unitarios.
- TypeScript config herdada de `@mio/typescript-config` (preset Next.js).

## Arquitetura

Documentacao completa em `docs/ARCHITECTURE.md`.

Resumo dos protocolos:

- Browser <-> Next.js Server: HTTPS
- Next.js Server <-> API Gateway: GraphQL sobre HTTPS
- Messenger -> Browser: SSE (Server-Sent Events)

O cliente nunca fala com microserviços internos diretamente — toda leitura/mutacao passa pelo Next.js Server (RSC ou Server Action), que encaminha ao API Gateway.

## CI/CD

- GitHub Actions em `.github/workflows/ci-web.yml`
- Trigger: push para main ou PRs que alterem `apps/web/**`, `packages/**`
- Pipeline: install -> lint -> type check -> tests
