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
2. Componentes do servidor consultam o **API Gateway** via GraphQL para popular a tela.
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
- **Private folders** `_nome` — pastas que começam com `_` não viram rota. Ex: `app/(portal)/_components/` guarda componentes exclusivos daquela seção sem ser alcançáveis por URL.
- **Layouts compostos** — `RootLayout` (fontes globais, `<html>`, `<body>`) → `PortalLayout` (Header + Footer) → `page.tsx`.

---

### 2. Design System (Componentes Reutilizáveis)

| | |
|---|---|
| **Localização** | `app/components/` |
| **Padrão** | Compound Components (Wrapper + peças) |
| **Styling** | Tailwind CSS v4 + tokens via `@theme` |
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

<BadgeWrapper>
  <BadgeIcon icon="mdi:fire" />
  <BadgeValue>1200 XP</BadgeValue>
</BadgeWrapper>
```

Famílias atuais:

- `components/button/` — `ButtonWrapper`, `ButtonText`, `ButtonIcon`
- `components/card/` — `CardWrapper`, `CardTitle`, `CardDescription`, `CardIcon`
- `components/gamification/` — `BadgeWrapper`, `BadgeIcon`, `BadgeValue`, `ProgressBar`

Cada família expõe um `index.ts` como barrel — o consumidor importa de `@/components/button`, não de arquivos internos.

---

### 3. Design Tokens (Tailwind v4 + CSS Variables)

| | |
|---|---|
| **Localização** | `app/globals.css` |
| **Mecanismo** | `@theme` do Tailwind v4 |

O tema é declarado em CSS puro dentro de `@theme`. Tailwind gera as classes utilitárias (`bg-primary`, `text-foreground`, `font-display`, etc.) automaticamente a partir dessas variáveis.

| Token | Propósito |
|---|---|
| `--color-primary` / `--color-primary-shadow` | Cor principal da marca (laranja) e sombra 3D |
| `--color-success` / `--color-success-shadow` | Estados de sucesso |
| `--color-background` / `--color-foreground` | Fundo e texto base |
| `--color-disabled` / `--color-disabled-foreground` | Estados desabilitados |
| `--font-display` (Outfit) | Títulos e CTAs |
| `--font-body` (Plus Jakarta Sans) | Texto corrido |

As fontes são carregadas via `next/font/google` no `RootLayout` e expostas como CSS variables — sem FOUT e sem requisições extras.

---

### 4. Storybook (Documentação Visual)

| | |
|---|---|
| **Framework** | `@storybook/nextjs-vite` |
| **Localização das stories** | `stories/` |
| **Addons** | `addon-a11y`, `addon-docs`, `chromatic` |

Cada componente do design system tem uma story espelhada em `stories/`. O Storybook roda isolado (`yarn storybook`, porta 6006) e serve como:

- **Playground visual:** inspecionar estados e variantes sem precisar de dados do backend.
- **Documentação viva:** `addon-docs` gera páginas a partir das stories.
- **Checagem de acessibilidade:** `addon-a11y` roda axe-core em cada story.

Organização: `stories/button/`, `stories/card/`, `stories/gamification/`, `stories/foundations/` (tipografia e paleta).

---

### 5. Comunicação com o Backend

| Canal | Protocolo | Quando |
|---|---|---|
| Server Components → Gateway | GraphQL sobre HTTPS | Leitura no SSR/RSC |
| Server Actions → Gateway | GraphQL sobre HTTPS | Mutações (login, concluir aula) |
| Browser → Messenger | SSE (Server-Sent Events) | Eventos em tempo real (XP, conquistas) |

**Por que toda a comunicação com o Gateway sai do servidor Next.js?**

- Segredos de sessão (tokens, cookies HTTP-only) nunca chegam ao JavaScript do cliente.
- O cliente recebe apenas HTML e os dados já filtrados — menos superfície de ataque e menos overfetching.
- O Gateway aceita chamadas apenas do Next.js, simplificando a política de CORS e o rate limiting.

O **Messenger** é a única exceção: o browser fala direto com ele por SSE em um canal unidirecional. Isso é seguro porque a conexão carrega o token de sessão, o Messenger apenas empurra eventos do usuário autenticado, e nada sensível trafega nesse canal.

---

## Estrutura de Diretórios

```
apps/web/
├── app/                          # App Router (Next.js 16)
│   ├── layout.tsx                # RootLayout: fontes, <html>, <body>
│   ├── globals.css               # Tokens (@theme) e estilos base
│   ├── components/               # Design System
│   │   ├── button/
│   │   ├── card/
│   │   └── gamification/
│   └── (portal)/                 # Route Group: landing/marketing
│       ├── layout.tsx            # Header + Footer
│       ├── page.tsx              # Home
│       └── _components/          # Componentes privados da rota
├── stories/                      # Storybook (espelha app/components)
│   ├── button/
│   ├── card/
│   ├── foundations/
│   └── gamification/
├── tests/
│   ├── unit/                     # Vitest + Testing Library
│   ├── integration/
│   └── e2e/
└── public/                       # Assets estáticos (logo, mascote)
```

---

## Fluxo de Dados

### Leitura (ex: carregar a home autenticada)

```
┌──────────┐   HTTPS         ┌──────────────┐   GraphQL   ┌──────────────┐
│  Browser │ ──────────────► │ Next.js (SSR) │ ──────────► │ API Gateway  │
└──────────┘                 └──────┬───────┘             └──────┬───────┘
                                    │                            │ gRPC
                                    │                            ▼
                                    │                    ┌──────────────┐
                                    │                    │ Microserviços │
                                    │                    └──────────────┘
                                    ▼
                             ┌──────────────┐
                             │ HTML pronto  │
                             │   + RSC      │
                             └──────────────┘
```

### Mutação com feedback em tempo real (ex: concluir uma aula)

```
Browser                Next.js Server        API Gateway        RabbitMQ        Messenger
   │                         │                    │                │                │
   │  submit (Server Action) │                    │                │                │
   │────────────────────────►│                    │                │                │
   │                         │  GraphQL mutation  │                │                │
   │                         │───────────────────►│                │                │
   │                         │                    │ gRPC → Core    │                │
   │                         │                    │───────────────►│                │
   │                         │ 200 OK             │ PUB            │ SUB            │
   │                         │◄───────────────────│  lesson.completed               │
   │ revalidate + redirect   │                    │                │                │
   │◄────────────────────────│                    │                │                │
   │                         │                    │                │                │
   │─────────── SSE (já aberto) ──────────────────────────────────────────────────► │
   │◄── event: xp.rewarded ─────────────────────────────────────────────────────────│
   │◄── event: achievement.unlocked ───────────────────────────────────────────────│
```

A UI atualiza por dois caminhos complementares:

- **Revalidação** (`revalidatePath` / redirect) no retorno da Server Action — garante que o próximo RSC veja o estado consistente.
- **SSE** do Messenger — empurra o XP e as conquistas sem precisar recarregar.

---

## Testes

| Camada | Ferramenta | Onde |
|---|---|---|
| Unit | Vitest + Testing Library | `tests/unit/` |
| Integração | Vitest | `tests/integration/` (placeholder) |
| E2E | Vitest | `tests/e2e/` |
| Visual/A11y | Storybook + `addon-a11y` | `stories/` |

Configs separadas (`vitest.unit.config.ts`, `vitest.e2e.config.ts`) permitem rodar cada camada isoladamente no CI.

---

## Por que essa estrutura é poderosa?

- **RSC por padrão:** bundle JS pequeno, SEO melhor e menos trabalho no dispositivo do usuário.
- **Server Actions isolam segredos:** credenciais e tokens nunca cruzam para o cliente.
- **Compound components:** fácil de compor, fácil de tipar, sem explosão de props.
- **Storybook + tokens:** design system evolui sem quebrar a aplicação — variantes são validadas em isolamento antes de chegarem às telas.
- **Stateless:** qualquer instância Next.js serve qualquer requisição — escalar é só adicionar réplicas atrás do load balancer.
- **SSE + revalidação:** o usuário vê feedback instantâneo (XP subindo) sem que isso dependa do ciclo de request/response tradicional.
