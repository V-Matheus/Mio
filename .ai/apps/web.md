---
globs: apps/web/**/*
---

# Mio Web

Frontend da plataforma gamificada de ensino de programação. Next.js 16 (App Router) server-first, consumindo o API Gateway NestJS via GraphQL. Real-time via SSE do Messenger.

## Stack

- **Framework:** Next.js 16.2 (App Router, React Server Components)
- **UI:** React 19
- **Linguagem:** TypeScript 5.9 (strict mode)
- **Styling:** Tailwind CSS v4 (tokens via `@theme` em `globals.css`)
- **Ícones:** Iconify (`@iconify/react`)
- **Fontes:** `next/font/google` — Outfit (display) + Plus Jakarta Sans (body)
- **Storybook:** `@storybook/nextjs-vite` com addons `a11y`, `docs`, `chromatic`
- **Runtime:** Node.js 24+
- **Package Manager:** Yarn 1.22
- **Monorepo:** Turbo (root em `../../`)
- **Linter/Formatter:** Biome (não usa ESLint/Prettier)
- **Testes:** Vitest + Testing Library
- **Docker:** porta 3000

## Comandos

```bash
yarn dev              # next dev --port 3000 (dispara o codegen automaticamente)
yarn build            # next build (dispara o codegen automaticamente)
yarn start            # next start
yarn lint             # biome lint
yarn format           # biome format --write
yarn check-types      # next typegen && tsc --noEmit (dispara o codegen automaticamente)
yarn test             # vitest run (todos os testes)
yarn test:unit        # vitest run --config vitest.unit.config.ts
yarn test:e2e         # vitest run --config vitest.e2e.config.ts
yarn test:cov         # coverage
yarn storybook        # storybook dev -p 6006
yarn build-storybook  # build estático do storybook
yarn codegen          # Compila o schema do API Gateway e gera os tipos GraphQL
yarn codegen:watch    # Roda o codegen no modo watch monitorando queries no código
```

## GraphQL & Codegen (Geração de Tipos)

O frontend utiliza **GraphQL** para comunicação e **GraphQL Code Generator** para tipagem forte automática de queries, mutações e fragmentos:
- **Fonte do Schema**: O schema vem do pacote de workspace `@mio/graphql-schema` (resolvido localmente e estaticamente de `../../packages/graphql-schema/schema.gql`). O codegen roda inteiramente offline e em ambientes de CI.
- **Tipagem no Código**: Operações escritas com `graphql(...)` em arquivos `src/**/*.{ts,tsx}` são compiladas para gerar tipos na pasta `src/lib/gql/generated/` (esta pasta está no `.gitignore` e é gerada sob demanda).
- **Execução Automática**: Praticamente todos os scripts principais (como `dev`, `build`, `test` e `check-types`) possuem ganchos `pre` (ex: `predev`) no `package.json` para executar o `yarn codegen` automaticamente antes do comando principal ser disparado.

## Estrutura

Código da aplicação vive em `src/`; a raiz de `apps/web/` guarda apenas arquivos de configuração (`next.config.js`, `tsconfig.json`, `vitest.*.config.ts`, `.storybook/`, `Dockerfile*`, `public/`).

- `src/` — código da aplicação
  - `app/` — App Router (apenas roteamento + composição de página)
    - `layout.tsx` — RootLayout (fontes, `<html>`, `<body>`)
    - `globals.css` — tokens de design via `@theme` do Tailwind v4
    - `(portal)/` — route group da landing; `_components/` são privados da rota
  - `components/` — design system compartilhado (button, card, avatar, icon, layout...). Importar via `@/components/<x>`
  - `lib/` — lógica de domínio por módulo (`lib/<dominio>/`)
  - `auth.ts` — NextAuth (handlers/signIn/signOut/auth); `proxy.ts` — middleware do Next 16
  - `@types/` — augmentations de módulo (ex.: `next-auth.d.ts`)
- `stories/` — Storybook espelhando `src/components/`
- `tests/unit`, `tests/integration`, `tests/e2e` — Vitest
- Alias `@/*` resolve para `src/*` (tsconfig + vitest configs).

## Convenções

- **Server Components por padrão.** Use Client Components (`"use client"`) somente quando precisar de estado/efeitos/eventos do browser.
- **Compound components** para o design system: `Wrapper` + peças (`Text`, `Icon`, `Title`, etc.), exportados via barrel `index.ts`.
- **Route groups** `(nome)` para organizar sem afetar URL; **private folders** `_nome` para esconder arquivos que não devem virar rota.
- **Imports: alias `@/` quando cruza pasta/módulo** (ex.: `@/components/icon`, `@/lib/auth/service`); caminho relativo **só com `./`** para arquivos co-locados na mesma pasta (barrels `index.ts`, compound components, `_components` de uma rota). Nunca `../` em `src/` — é robusto a mover arquivos e evita cadeias `../../`. **Imposto pelo Biome** (`noRestrictedImports` no override de `apps/web/{src,tests,stories}` em `biome.json`); arquivos de config fora de `src/` (ex.: `.storybook/`) podem usar `../`.
- **Mutações sensíveis** devem passar por Server Actions — nunca chamar o Gateway direto do browser.
- **Server Actions vivem por domínio em `lib/<dominio>/actions/`** (ex.: `lib/auth/actions/`), não em `_actions/` dentro de route groups. Motivo: route groups como `(app)` abrangem o app inteiro e viram "dumping ground". Cada domínio agrupa `actions/` + `service.ts` + `schemas/` + `types/` + `graphql/`. Componentes importam via barrel `@/lib/<dominio>/actions`. Ações ficam finas (parse FormData -> Zod schema -> service -> FormState/redirect); lógica de domínio fica no `service.ts`. Testes espelham em `tests/unit/lib/<dominio>/actions/`.
- **Tokens de design** vivem em `globals.css` sob `@theme`; não hardcode cores/fontes nos componentes.
- Commits seguem **Conventional Commits** (feat, fix, docs, refactor, test, chore, etc.), subject em lowercase.
- Pre-commit hooks via Husky: lint-staged roda biome check, type check e testes unitários.
- TypeScript config herdada de `@mio/typescript-config` (preset Next.js).

## Arquitetura

Documentação completa em `docs/ARCHITECTURE.md`.

Resumo dos protocolos:

- Browser <-> Next.js Server: HTTPS
- Next.js Server <-> API Gateway: GraphQL sobre HTTPS
- Messenger -> Browser: SSE (Server-Sent Events)

O cliente nunca fala com microserviços internos diretamente — toda leitura/mutação passa pelo Next.js Server (RSC ou Server Action), que encaminha ao API Gateway.

## CI/CD

- GitHub Actions em `.github/workflows/ci-web.yml`
- Trigger: push para main ou PRs que alterem `apps/web/**`, `packages/**`
- Pipeline: install -> lint -> type check -> tests
