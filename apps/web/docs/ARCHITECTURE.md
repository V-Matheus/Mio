# Arquitetura do Frontend — Mio

> Visão geral da arquitetura do cliente web da plataforma Mio baseada em **Domain-Driven Design (DDD) Modular**, **Next.js 16 (App Router)** e **React 19**.

---

## 1. Visão Geral e Princípios

O frontend é uma aplicação **Next.js 16 (App Router)** estruturada em módulos de domínio independentes (Vertical Slices) e uma camada compartilhada (*shared*).

### Princípios Fundamentais:
- **Server-First (RSC):** Renderização no servidor por padrão, enviando o mínimo de JavaScript para o browser.
- **Thin Routing Layer:** A pasta `src/app/` é estritamente uma camada fina de roteamento e injeção de parâmetros, sem componentes privados (`_components`) ou lógica de negócios.
- **Encapsulamento de Módulo (DDD):** Cada domínio de negócio possui sua própria pasta em `src/modules/<dominio>/`. Componentes internos de um domínio são privados e nunca expostos para outros módulos.
- **Camada Compartilhada (`src/shared`):** Primitivas de UI (Design System), clientes de infraestrutura (GraphQL/Gateway), utilitários globais e tipos gerados ficam centralizados em `src/shared`.
- **Consumidor Único do API Gateway:** Toda chamada externa sai do servidor Next.js em direção ao BFF/Gateway NestJS via GraphQL sobre HTTPS autenticado.

---

## 2. Estrutura de Diretórios (`apps/web/src`)

```
apps/web/src/
├── app/                  # 1. Thin Routing Layer (Next.js App Router)
│   ├── (app)/            # Área autenticada (perfil, ranking, trilhas, studio, painel)
│   ├── (auth)/           # Fluxos de autenticação (login, cadastro, recuperar-senha)
│   ├── (portal)/         # Landing page pública e layout institucional
│   └── globals.css       # Design tokens Tailwind v4 (@theme)
│
├── modules/              # 2. Domínios de Negócio (Vertical DDD)
│   ├── auth/             # Autenticação, sessão, formulários de login/cadastro
│   ├── catalog/          # Catálogo de trilhas, detalhes e matrículas
│   ├── gamification/     # Ranking, leaderboards e pódios de XP
│   ├── home/             # View de boas-vindas do aluno autenticado
│   ├── portal/           # Landing page pública e componentes institucionais
│   ├── profile/          # Perfil do aluno, métricas, streak e histórico
│   ├── progress/         # Player de aula e persistência de progresso
│   └── studio/           # Espaço do professor/criador (gestão de trilhas e lições)
│
├── shared/               # 3. Camada Compartilhada / Cross-Cutting
│   ├── components/       # Design System UI (Avatar, Badge, Button, Card, Input, Modal, ProgressBar, etc.)
│   ├── gateway/          # Cliente GraphQL tipado para o API Gateway BFF (getGatewayClient)
│   ├── gql/              # Tipos TypeScript gerados pelo GraphQL Codegen
│   └── utils/            # Utilitários puros (cn, formatters)
│
├── auth.ts               # Configuração do NextAuth
├── proxy.ts              # Middleware / controle de rotas
└── @types/               # Declarações globais de tipagem
```

---

## 3. Anatomia de um Módulo (`src/modules/<dominio>/`)

Cada módulo possui uma estrutura estrita e padronizada. **O arquivo `index.ts` é o ÚNICO arquivo permitido na raiz do módulo.**

```
src/modules/<dominio>/
├── actions/             # Server Actions do Next.js (mutação/escrita)
├── components/          # Componentes visuais PRIVADOS do domínio (+ testes co-localizados)
├── graphql/             # Documentos GraphQL atômicos por operação (.ts)
├── queries/             # Funções de leitura de dados para Server Components/Views
├── schemas/             # Schemas Zod de validação de formulários (+ testes)
├── services/            # Serviços de integração com o Gateway (service.ts, service.test.ts, index.ts)
├── types/               # Tipos e interfaces TypeScript específicos do domínio (index.ts)
├── utils/               # Utilitários internos do módulo
├── views/               # Telas completas (Views) consumidas pelas rotas do app/
└── index.ts             # ÚNICO arquivo na raiz do módulo (Public API)
```

### Regras de Encapsulamento do Módulo:
1. **`index.ts` (Public API):**
   - Deve exportar apenas `views`, `types`, e quando necessário `queries`, `actions` e `schemas`.
   - **NUNCA deve exportar `components/`**: Os componentes de um módulo são de uso estritamente interno de suas próprias `views/`.
   - Se um componente precisar ser utilizado por múltiplos módulos, ele é um componente compartilhado e **deve pertencer a `src/shared/components/`**.
2. **`views/`:**
   - Componentes de tela raiz que compõem os componentes internos do módulo, buscam dados via `queries/` ou conectam Server Actions.
   - São exportados pelo `index.ts` do módulo e importados pelos arquivos `page.tsx` da camada `app/`.
3. **`services/`:**
   - Contém a comunicação HTTP/GraphQL com o Gateway via `getGatewayClient()`.
   - Concentra todo o tratamento de erros em blocos `try/catch`.

---

## 4. Camada de Roteamento (`src/app/`)

A camada `app/` é deliberadamente mantida "magra" (*thin routing layer*):

- **Sem pastas `_components`:** Não é permitido criar pastas `_components` dentro das rotas de `app/`.
- **Papel das Páginas (`page.tsx`):** Receber parâmetros da URL (`params`, `searchParams`), definir metadados (`Metadata`) e delegar a renderização diretamente para a `View` do módulo correspondente:

```tsx
// Exemplo: src/app/(app)/ranking/page.tsx
import type { Metadata } from "next"
import { RankingView } from "@/modules/gamification"

export const metadata: Metadata = {
  title: "Ranking Global | Mio",
  description: "Acompanhe sua posição e dispute o topo do ranking global.",
}

export default async function RankingPage() {
  return await RankingView()
}
```

- **A tag `<main>` é única:** Pertence exclusivamente ao layout base/AppShell (`src/shared/components/layout/app-shell.tsx`). Arquivos de página (`page.tsx`) e `views` nunca devem renderizar a tag `<main>`.

---

## 5. Design System Compartilhado (`src/shared/components/`)

Componentes visuais agnósticos de domínio que seguem o padrão **Compound Components** com `data-slot="..."`:

| Componente | Localização | Peças / Subcomponentes |
| :--- | :--- | :--- |
| **Avatar** | `shared/components/avatar` | `AvatarWrapper`, `AvatarImage`, `AvatarFallback` |
| **Badge** | `shared/components/badge` | `BadgeWrapper`, `BadgeIcon`, `BadgeValue` |
| **Button** | `shared/components/button` | `ButtonWrapper`, `ButtonText`, `ButtonIcon` |
| **Card** | `shared/components/card` | `CardWrapper`, `CardTitle`, `CardDescription`, `CardIcon`, `CardText` |
| **FilterGroup** | `shared/components/filter-group`| `FilterGroupWrapper`, `FilterGroupLabel`, `FilterGroupList`, `FilterGroupItem`, `FilterGroup` |
| **Icon** | `shared/components/icon` | `Icon` (Iconify wrapper) |
| **Input** | `shared/components/input` | `InputWrapper`, `InputField`, `InputControl`, `InputAdornment`, `InputLabel` |
| **Layout** | `shared/components/layout` | `AppShell`, `Sidebar`, `SidebarUser`, `NavItems` |
| **Markdown** | `shared/components/markdown-renderer` | `MarkdownRenderer` |
| **Modal** | `shared/components/modal` | `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter` |
| **ProgressBar** | `shared/components/progress-bar` | `ProgressBar` |

---

## 6. Fluxo de Dados e Regras de Negócio

### 6.1 Leitura (Queries)
1. A rota (`page.tsx`) invoca a `View` correspondente.
2. A `View` (Server Component) consome funções da pasta `queries/` do seu módulo (ex.: `getProfileQuery()`).
3. A função de query invoca o serviço (`services/profile.service.ts`), que chama o API Gateway via GraphQL.

```
page.tsx ──► View ──► queries/ ──► services/ ──► Gateway (GraphQL)
```

### 6.2 Escrita (Mutations / Server Actions)
1. Formulários de cliente invocam Server Actions da pasta `actions/` do módulo.
2. A Server Action valida os dados com Zod (`schemas/`) e chama o serviço correspondente (`services/`).
3. O serviço trata exceções em `try/catch` e devolve um resultado seguro (`{ ok: true }` ou `{ ok: false, error }`).
4. A Server Action executa `revalidatePath(...)` caso a operação seja bem-sucedida.

```
Client Component ──► actions/ (valida Zod) ──► services/ (try/catch) ──► Gateway (GraphQL)
```

---

## 7. Path Aliases e Regras de Importação

Configurados no `tsconfig.json`, `vitest.config.ts` e validados pelo **Biome**:

| Alias | Mapeamento | Uso |
| :--- | :--- | :--- |
| `@/*` | `./src/*` | Importações gerais dentro de `src/` |
| `@modules/*` | `./src/modules/*` | Importações entre camadas e módulos |
| `@shared/*` | `./src/shared/*` | Componentes compartilhados, gateway e utils |

### Regra de Imports (Biome Linter):
- **Imports relativos (`./`)**: Permitidos **apenas** para arquivos co-localizados na mesma pasta.
- **Imports que cruzam pastas ou módulos**: Devem obrigatoriamente utilizar o alias `@/` ou `@modules/` / `@shared/`.

---

## 8. Checklist de Regras Arquiteturais

- [x] **Zero `_components` em `app/`:** Toda a interface de tela é uma `View` dentro de `src/modules/<dominio>/views/`.
- [x] **Apenas `index.ts` na raiz do módulo:** Nenhum `service.ts`, `types.ts` ou `schemas.test.ts` solto na raiz do módulo.
- [x] **Componentes do módulo são privados:** `src/modules/<dominio>/index.ts` nunca exporta a pasta `components/`.
- [x] **Componentes reutilizados vão para `shared`:** Se dois ou mais domínios precisam do mesmo componente visual, ele pertence a `src/shared/components/`.
- [x] **`try/catch` exclusivo em `services/`:** Actions não contêm blocos `try/catch` vazados.
- [x] **Componentes nunca chamam `services/` diretamente:** Componentes consomem `queries/` para leitura e `actions/` para escrita.
