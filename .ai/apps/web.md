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
- **Utilitários:** Utilitário centralizado `cn` em `src/utils/` (`@/utils`)
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
  - `components/` — design system compartilhado (button, card, avatar, filter-group, icon, layout...). Importar via `@/components/<x>`
  - `lib/` — lógica de domínio por módulo (`lib/<dominio>/`)
  - `utils/` — utilitários globais (`cn`, etc.). Importar via `@/utils`
  - `auth.ts` — NextAuth (handlers/signIn/signOut/auth); `proxy.ts` — middleware do Next 16
  - `@types/` — augmentations de módulo (ex.: `next-auth.d.ts`)
- `stories/` — Storybook espelhando `src/components/`
- `tests/unit`, `tests/integration`, `tests/e2e` — Vitest
- Alias `@/*` resolve para `src/*` (tsconfig + vitest configs).

## Convenções Arquiteturais e Padrões de Código

- **Server Components por padrão.** Use Client Components (`"use client"`) somente quando precisar de estado/efeitos/eventos do browser.
- **Regra Rígida de Consumo por Componentes:** Componentes/Páginas NUNCA chamam arquivos de serviço (`service.ts`) diretamente.
  - Para **Leitura / Data Fetching (Queries)**: Componentes e Server Components (`page.tsx`) chamam exclusivamente as funções expostas em `lib/<dominio>/queries/`.
  - Para **Escrita / Mutações (Actions)**: Formulários e eventos do cliente chamam exclusivamente as funções expostas em `lib/<dominio>/actions/`.
- **Estrutura das pastas em `src/lib/<dominio>/`**:
  - Cada domínio (ex.: `auth`, `catalog`, `studio`) organiza seus arquivos em:
    - `queries/`: Funções de leitura de dados exportadas via `index.ts` (ex.: `getTracksQuery`, `getTrackQuery`).
    - `actions/`: Server Actions de escrita exportadas via `index.ts` (ex.: `enrollInTrackAction`, `createTrackAction`).
    - `graphql/`: Documentos GraphQL atômicos por operação exportados via `index.ts`.
    - `types/`: Tipos divididos em arquivos por entidade (ex.: `track.ts`, `lesson.ts`, `section.ts`) exportados via `index.ts`.
    - `service.ts`: Camada de serviço responsável pelas chamadas HTTP ao Gateway (detalhe de infraestrutura).
- **Padrão de Tratamento de Erros (Error Handling Strategy)**:
  - **Na camada de Service (`service.ts`)**: Trata **toda** a comunicação HTTP/GraphQL com a API/Gateway usando blocos `try/catch` e a função `gatewayError(error, fallback)`. Retorna objetos de resultado fortemente tipados (`{ ok: true; data } | { ok: false; error: string }`) ou fallbacks seguros (`null`, `[]`).
  - **Na camada de Actions (`actions/*.ts`)**: **Sem blocos `try/catch`**. As ações concentram-se apenas em validar dados de entrada (schemas Zod ou verificações de formulário), invocar a função do service e revalidar caminhos (`revalidatePath`).
- **Semântica de Layout HTML:** A tag `<main>` é única na aplicação e fica declarada estritamente no layout global (`AppShell`). Nunca inclua a tag `<main>` em arquivos de rota ou sub-páginas.
- **Componentes do Design System vs. Componentes de Página:**
  - Componentes reutilizáveis globais ficam em `src/components/<nome>/` usando o padrão **Compound Components** (`Wrapper` + peças atômicas com `data-slot="..."`) exportados por barrel `index.ts`.
  - Componentes específicos de uma página/funcionalidade devem ser co-localizados dentro da pasta privada `_components/` da rota (ex.: `app/(app)/trilhas/_components/`).
- **Combinação de Classes CSS:** Utilizar o utilitário centralizado `cn` importado de `@/utils` (`import { cn } from "@/utils"`).
- **Imports: alias `@/` quando cruza pasta/módulo** (ex.: `@/components/icon`, `@/lib/auth/queries`, `@/utils`); caminho relativo **só com `./`** para arquivos co-locados na mesma pasta. Nunca `../` em `src/`.
- **Tokens de design** vivem em `globals.css` sob `@theme`; não hardcode cores/fontes nos componentes.
- Commits seguem **Conventional Commits** (feat, fix, docs, refactor, test, chore, etc.), subject em lowercase.
- Pre-commit hooks via Husky: lint-staged roda biome check, type check e testes unitários.
- TypeScript config herdada de `@mio/typescript-config` (preset Next.js).

## Arquitetura

Documentação completa em `docs/ARCHITECTURE.md`.
