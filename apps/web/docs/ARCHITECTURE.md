# Arquitetura do Frontend — Mio

> Visão geral da arquitetura do cliente web da plataforma Mio.

---

## Visão Geral

O frontend é uma aplicação **Next.js 16 (App Router)** que atua como a "vitrine" do sistema. Ele é:

- **Server-first:** renderiza por padrão em React Server Components (RSC), enviando o mínimo de JavaScript para o cliente.
- **Stateless:** não mantém estado compartilhado no processo do Next.js — qualquer instância atende qualquer requisição, o que permite escalar horizontalmente.
- **Consumidor único do API Gateway:** toda chamada ao backend sai pelo servidor Next.js em direção ao Gateway NestJS via GraphQL sobre HTTPS. O browser não fala diretamente com microserviços internos.
- **Real-time via SSE:** para updates ao vivo (XP, conquistas), o browser abre uma conexão SSE com o **Messenger** do backend.

O fluxo principal é:

1. O browser acessa uma rota e recebe HTML renderizado pelo servidor Next.js.
2. Componentes do servidor consultam o **API Gateway** via GraphQL a partir da camada de **Queries** para popular a tela.
3. **Server Actions** lidam com mutações sensíveis (login, conclusão de aula) sem expor segredos ao cliente.
4. Em rotas autenticadas, o cliente assina o **Messenger** (SSE) para receber eventos em tempo real.

---

## Camadas

### 1. App Router (Rotas e Layouts)

| | |
|---|---|
| **Tecnologia** | Next.js 16 — App Router |
| **Responsabilidade** | Definir rotas, layouts aninhados e fronteiras de renderização |
| **Estratégia** | Server Components por padrão, Client Components só quando necessário |

A pasta `app/` é a raiz do App Router. Cada segmento vira uma rota e cada `layout.tsx` envolve os filhos daquela seção.

**Convenções do App Router usadas no projeto:**

- **Route Groups** `(nome)` — agrupam rotas sem afetar a URL. Ex: `app/(portal)/` isola o marketing/landing do restante.
- **Private folders** `_nome` — pastas que começam com `_` não viram rota. Ex: `app/(app)/trilhas/_components/` guarda componentes exclusivos da rota de trilhas.
- **Layouts compostos** — `RootLayout` (fontes globais, `<html>`, `<body>`) → `AppShell` (Sidebar + Header + `<main>`) → `page.tsx`.
- **A tag `<main>` é única**: Definida exclusivamente no layout global. Arquivos de página (`page.tsx`) nunca contêm a tag `<main>`.

---

### 2. Design System (Componentes Reutilizáveis)

| | |
|---|---|
| **Localização** | `src/components/` |
| **Padrão** | Compound Components (Wrapper + peças com `data-slot="..."`) |
| **Styling** | Tailwind CSS v4 + tokens via `@theme` |
| **Utilitários** | `cn` de `@/utils` |
| **Ícones** | Iconify (`@iconify/react`) |

Cada "componente" é um conjunto pequeno de peças combináveis. Isso evita props booleanas em cascata e deixa o consumidor montar a estrutura que precisa:

```tsx
<ButtonWrapper variant="primary">
  <ButtonText>Começar</ButtonText>
</ButtonWrapper>

<CardWrapper variant="reward">
  <CardIcon icon="mdi:star" />
  <CardTitle>Nível 3</CardTitle>
  <CardDescription>Você desbloqueou uma conquista</CardDescription>
</CardWrapper>

<FilterGroup
  label="Categoria"
  items={["Todos", "Front-End", "Back-End"]}
  selectedItem={selectedCategory}
  onSelect={setSelectedCategory}
/>
```

Famílias atuais em `src/components/`:

- `components/button/` — `ButtonWrapper`, `ButtonText`, `ButtonIcon`
- `components/card/` — `CardWrapper`, `CardTitle`, `CardDescription`, `CardIcon`
- `components/filter-group/` — `FilterGroupWrapper`, `FilterGroupLabel`, `FilterGroupList`, `FilterGroupItem`, `FilterGroup`
- `components/gamification/` — `BadgeWrapper`, `BadgeIcon`, `BadgeValue`, `ProgressBar`
- `components/input/` — `InputWrapper`, `InputField`, `InputControl`, `InputAdornment`, `InputLabel`

Cada família expõe um `index.ts` como barrel — o consumidor importa de `@/components/filter-group`, não de arquivos internos.

---

### 3. Módulos de Domínio (`src/lib/<dominio>/`)

Cada domínio de negócios da aplicação (ex.: `auth`, `catalog`, `studio`) segue uma estrutura estrita de pastas:

- `lib/<dominio>/queries/` — Funções de leitura de dados para Server Components/Páginas, exportadas por `index.ts`.
- `lib/<dominio>/actions/` — Server Actions de escrita/mutação, exportadas por `index.ts`.
- `lib/<dominio>/graphql/` — Documentos GraphQL atômicos por operação, exportados por `index.ts`.
- `lib/<dominio>/types/` — Tipos divididos em sub-módulos por entidade (ex.: `track.ts`, `lesson.ts`, `section.ts`), re-exportados por `index.ts`.
- `lib/<dominio>/service.ts` — Serviço de infraestrutura que executa chamadas GraphQL no Gateway.

---

### 4. Regra de Consumo de Dados por Componentes

- **Componentes NUNCA consomem `service.ts` diretamente.**
- Para **Leitura (Queries)**: Componentes e Server Components (`page.tsx`) usam as funções de `queries/` (ex.: `getTracksQuery`).
- Para **Escrita (Mutações)**: Formulários e eventos do cliente usam as Server Actions de `actions/` (ex.: `enrollInTrackAction`).

---

### 5. Padrão de Tratamento de Erros (Error Handling)

1. **Camada de Serviço (`service.ts`)**:
   - Concentra **todo** o tratamento de erros HTTP/GraphQL.
   - Envolve requisições em blocos `try/catch` e utiliza `gatewayError(error, fallback)` do cliente da Gateway.
   - Retorna um resultado fortemente tipado:
     ```typescript
     { ok: true; data: T } | { ok: false; error: string }
     ```
     ou fallbacks seguros (`null`, `[]`).

2. **Camada de Actions (`actions/*.ts`)**:
   - **Sem blocos `try/catch`**.
   - Responsável apenas por validar inputs (schemas Zod ou regras de formulário), chamar o serviço e executar `revalidatePath(...)` caso a resposta do serviço seja bem-sucedida (`res.ok`).

---

### 6. Design Tokens (Tailwind v4 + CSS Variables)

| | |
|---|---|
| **Localização** | `src/app/globals.css` |
| **Mecanismo** | `@theme` do Tailwind v4 |

O tema é declarado em CSS puro dentro de `@theme`. Tailwind gera as classes utilitárias (`bg-primary`, `text-foreground`, `font-display`, etc.) automaticamente a partir dessas variáveis.

---

## Fluxo de Dados

### Leitura (ex: carregar o catálogo de trilhas)

```
┌──────────┐   HTTPS         ┌──────────────┐   GraphQL   ┌──────────────┐
│  Browser │ ──────────────► │ Next.js (SSR) │ ──────────► │ API Gateway  │
└──────────┘                 └──────┬───────┘             └──────┬───────┘
                                    │ (chama              │ gRPC
                                    │  getTracksQuery)    ▼
                                    │                    ┌──────────────┐
                                    │                    │ Microserviços │
                                    │                    └──────────────┘
                                    ▼
                             ┌──────────────┐
                             │ HTML pronto  │
                             │   + RSC      │
                             └──────────────┘
```

### Mutação (ex: matricular-se em uma trilha)

```
Browser                 Next.js Server (Action)             API Gateway
   │                             │                               │
   │  submit (Action sem try/catch)                              │
   │────────────────────────────►│                               │
   │                             │  Service (com try/catch)      │
   │                             │──────────────────────────────►│
   │                             │  GraphQL mutation             │
   │                             │◄──────────────────────────────│
   │                             │  { ok: true } / { ok: false } │
   │ revalidatePath + Result     │                               │
   │◄────────────────────────────│                               │
```

---

## Resumo das Principais Regras

- **RSC por padrão:** bundle JS pequeno, SEO melhor.
- **Componentes chamam apenas `queries/` (para leitura) e `actions/` (para escrita):** Nunca importar `service.ts` direto nos componentes.
- **Tratamento de erro na raiz do serviço:** `try/catch` fica exclusivamente em `service.ts`. Actions são limpas e focadas em validações de formulário.
- **Compound components com `data-slot`:** simples de compor e inspecionar.
- **Componentes privados na rota (`_components`):** tudo que é específico de uma página fica co-localizado em `_components` na pasta da rota.
- **Tag `<main>` única:** pertencente apenas ao layout global.
