---
alwaysApply: true
---

# Mio Monorepo

Repositório unificado da plataforma gamificada de ensino de programação. Organizado em um monorepo gerenciado via **Yarn Workspaces** e **Turborepo** (`turbo.json`).

## Estrutura do Projeto

O repositório está estruturado da seguinte forma:

- **`apps/`** (Aplicações Principais)
  - **`api/`**: Gateway API e microsserviços NestJS 11 gerenciados em monorepo interno (Nest CLI).
  - **`web/`**: Frontend web desenvolvido em Next.js 16 (App Router), React 19 e Tailwind CSS v4.
- **`packages/`** (Bibliotecas e Configurações Compartilhadas)
  - **`graphql-schema/`**: Schema GraphQL gerado e exportado a partir do Gateway NestJS.
  - **`grpc-contracts/`**: Definições e compilador dos contratos gRPC para comunicação interna de microsserviços.
  - **`testing-config/`**: Configuração base compartilhada do Vitest.
  - **`typescript-config/`**: Pre-sets de configuração TypeScript compartilhados.

## Comandos da Raiz

Todos os comandos de tarefas principais da raiz utilizam o **Turbo** para orquestração e cache eficiente:

```bash
yarn dev              # Executa o ambiente de desenvolvimento local (turbo run dev)
yarn build            # Compila todas as aplicações e pacotes (turbo run build)
yarn lint             # Executa a verificação de lint (Biome) em todo o monorepo
yarn format           # Executa a formatação do código (Biome) em todo o monorepo
yarn check-types      # Executa a validação de tipos TypeScript em todo o monorepo
yarn test             # Roda toda a suíte de testes (Vitest)
yarn test:unit        # Roda apenas os testes unitários do monorepo
yarn test:e2e         # Roda apenas os testes e2e do monorepo
yarn test:cov         # Roda cobertura de testes global

# Infraestrutura & Docker Compose
yarn docker:build     # Compila a imagem Docker Compose do monorepo
yarn docker:up        # Sobe o ambiente no Docker Compose
yarn docker:down      # Derruba o ambiente Docker Compose
yarn docker:dev       # Roda o ambiente de desenvolvimento local diretamente em containers
yarn docker:dev:down  # Desliga a stack local do Docker Compose de dev

# Configuração de IA
yarn setup:ai         # Script interativo de configuração local de IAs (Claude, Antigravity, etc.)
```

## Arquitetura do Frontend (`apps/web`) — Regras Obrigatórias

O frontend adota o padrão **Modular / Domain-Driven Design (DDD)** dividido em `src/modules/` e `src/shared/`:

### 1. Estrutura de Módulos (`src/modules/<dominio>/`)
- **Único arquivo na raiz do módulo:** Apenas `index.ts` pode existir na raiz de cada pasta de módulo.
- **Subpastas padronizadas:** `actions/`, `components/`, `graphql/`, `queries/`, `schemas/`, `services/`, `types/`, `utils/`, `views/`.
- **Encapsulamento de Componentes:** Componentes dentro de `components/` de um módulo são **privados e exclusivos** das suas `views/`. O `index.ts` do módulo **NUNCA deve exportar `components/`**.
- **Componentes Compartilhados:** Se um componente visual for consumido por mais de um módulo (ex.: `Badge`, `ProgressBar`), ele obrigatoriamente pertence a `src/shared/components/`.

### 2. Camada de Roteamento (`src/app/`)
- **Thin Routing Layer:** `src/app/` serve apenas para mapear rotas, injetar parâmetros e definir metadados.
- **Zero `_components` em `app/`:** Não crie pastas de componentes dentro do roteador. As páginas (`page.tsx`) devem apenas chamar a `View` correspondente exportada pelo módulo (ex: `return await ProfileView()`).
- **Tag `<main>` única:** Pertence exclusivamente ao layout base (`AppShell`). `page.tsx` e `views` nunca devem renderizar `<main>`.

### 3. Fluxo de Dados e Tratamento de Erros
- **Componentes nunca importam `services/`:** Componentes usam `queries/` para leitura e `actions/` para escrita.
- **`try/catch` exclusivo em `services/`:** Serviços concentram o tratamento de erro e chamadas GraphQL. Server Actions cuidam de validações Zod e revalidações sem blocos `try/catch` manuais.

### 4. Aliases e Imports (Biome Linter)
- Use `@/modules/<dominio>/...` ou `@modules/...` para código de domínio.
- Use `@/shared/...` ou `@shared/...` para código compartilhado.
- Caminhos relativos (`./`) são permitidos **apenas** para arquivos na mesma pasta. Imports que cruzam pastas devem usar aliases.

## Controle de Qualidade e Convenções

- **Biome**: O monorepo utiliza o Biome para linting e formatação, aplicando regras de forma global no arquivo `biome.json`.
- **Husky**: Ganchos de pré-commit configurados em `.husky/` executam o `lint-staged` que roda biome check, typecheck e testes unitários apenas nos arquivos modificados.
- **Commits**: Seguem a especificação de **Conventional Commits** (feat, fix, docs, refactor, test, chore, etc.) com subject em letras minúsculas.
