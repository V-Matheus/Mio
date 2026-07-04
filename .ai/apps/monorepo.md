---
alwaysApply: true
---

# Mio Monorepo

Repositório unificado da plataforma gamificada de ensino de programação. Organizado em um monorepo gerenciado via **Yarn Workspaces** e **Turborepo** (`turbo.json`).

## Estrutura do Projeto

O repositório está estruturado da seguinte forma:

- **`apps/`** (Aplicações Principais)
  - **`api/`**: Gateway API e microsserviços NestJS 11 gerenciados em monorepo interno (Nest CLI).
  - **`web/`**: Frontend web desenvolvido em Next.js 16 (App Router) e React 19.
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

## Controle de Qualidade e Convenções

- **Biome**: O monorepo utiliza o Biome para linting e formatação, aplicando regras de forma global no arquivo `biome.json`.
- **Husky**: Ganchos de pré-commit configurados em `.husky/` executam o `lint-staged` que roda biome check, typecheck e testes unitários apenas nos arquivos modificados.
- **Commits**: Seguem a especificação de **Conventional Commits** (feat, fix, docs, refactor, test, chore, etc.) com subject em letras minúsculas.
