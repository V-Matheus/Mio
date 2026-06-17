# 08 — Web Shell autenticado

Layout, navegação e telas pessoais do usuário logado: `/home`, `/perfil`, streak, navbar, sidebar, integração com XP/conquistas vindas do real-time.

## Status atual

### Frontend (`apps/web`)
- ✅ Landing pública em `app/(portal)/` com header + footer.
- ✅ Fluxo de auth em `app/(auth)/` (login, cadastro, recuperar senha).
- ✅ `proxy.ts` redireciona logado → `/home` e anônimo → `/login`.
- ✅ Design system base (button, card, input, gamification badges, progress bar).
- ✅ Route group `app/(app)/` para rotas autenticadas, com `layout.tsx` (`AppShell`).
- ✅ `AppShell` baseado em **sidebar** (sem topbar — ver decisão): logo + navegação + bloco do usuário no rodapé; vira drawer no mobile.
- ✅ Componentes de layout: `Sidebar`, `SidebarUser` (avatar + menu Perfil/Sair). Avatar no design system (`AvatarWrapper`, `AvatarImage` com fallback de iniciais).
- ✅ Rota `/home` (placeholder com saudação — **não** é o dashboard completo ainda).
- ✅ Rota `/perfil` mínima (avatar + nome + e-mail de `/me`; cards de gamificação ainda não).
- ❌ Nenhuma exibição de streak (depende do backend).
- ❌ Dashboard `/home` completo, cards de progresso, conquistas, tecnologias (dependem dos resolvers `home`/`profile`).
- ❌ `RealtimeProvider` (spec 06) ainda não integrado ao layout.

### Designs disponíveis
Em `/figma-exports/`:
- `home-1.png` ... `home-5.png` — variações da home pública (já implementada).
- `home-autenticado.png` — **home logada**.
- `perfil-1.png`, `perfil-2.png` — telas de perfil.
- `cursos.png` — listagem de cursos/trilhas.
- `trilha.png` — detalhe de trilha.
- `aula-1.png`, `aula-2.png` — player de aula.

> Estes designs devem guiar a implementação visual. Quem trabalhar nessa spec deve abrir os PNGs como referência.

## Escopo

1. Criar **route group** `app/(app)/` para tudo que exige login.
2. **Layout autenticado** com `AppShell`:
   - Sidebar à esquerda (logo Mio + navegação principal).
   - Header superior com search, XP/level badge (ProgressBar) e avatar/menu do usuário.
3. **Home dashboard** (`/home`):
   - Cumprimento personalizado (`Olá, {nome}!`).
   - Cards de progresso por trilha matriculada.
   - Mascote Mio acompanhando.
   - Lista das próximas aulas/CTA para continuar.
4. **Perfil** (`/perfil`):
   - Avatar + nome + nível + XP total.
   - Streak (dias consecutivos — ver decisão).
   - Histórico de atividades recentes.
   - Tecnologias dominadas (derivado das trilhas concluídas).
   - Conquistas recentes.
5. **Streak**: contador de dias consecutivos com pelo menos 1 evento `lesson.completed`. Persistir em `User.streakCurrent`, `User.streakBest`, `User.lastStudyDate` no Core.

## Contratos

### Streak (extensão do `User` no Core)

```prisma
model User {
  // ... campos existentes
  streakCurrent  Int       @default(0)
  streakBest     Int       @default(0)
  lastStudyDate  DateTime?
}
```

Atualização: consumer adicional em **Core** (ou job dedicado) sobre `lesson.completed`:

- Se `lastStudyDate` é "ontem" no fuso do usuário (assumir UTC por enquanto): `streakCurrent += 1`.
- Se "hoje": ignora (não incrementa).
- Caso contrário: `streakCurrent = 1`.
- `streakBest = max(streakBest, streakCurrent)`.
- `lastStudyDate = now`.

### GraphQL

```graphql
extend type User {
  streakCurrent: Int!
  streakBest: Int!
  lastStudyDate: String
}

type HomeDashboard {
  user: User!
  xp: UserXp!
  enrolledTracks: [TrackProgress!]!
  recentAchievements: [UserAchievement!]!
}

type TrackProgress {
  track: Track!
  completedLessons: Int!
  totalLessons: Int!
  nextLesson: LessonSummary
}

extend type Query {
  home: HomeDashboard!
  profile(userCode: ID): UserProfile!     # null = self
}

type UserProfile {
  user: User!
  xp: UserXp!
  achievements: [UserAchievement!]!
  recentActivity: [ActivityEntry!]!
}

type ActivityEntry {
  kind: ActivityKind!     # LESSON_COMPLETED | ACHIEVEMENT_UNLOCKED
  at: String!
  title: String!
  meta: String
}

enum ActivityKind { LESSON_COMPLETED ACHIEVEMENT_UNLOCKED }
```

### Estrutura de rotas

```
src/app/                               # código da app vive em src/
├── (portal)/                          # ✅ existente — público
├── (auth)/                            # ✅ existente
└── (app)/                             # ✅ criado
    ├── layout.tsx                     # ✅ AppShell (sidebar)
    ├── home/
    │   └── page.tsx                   # ✅ placeholder (saudação)
    ├── trilhas/                       # ❌ (overlap com spec 02)
    │   ├── page.tsx
    │   └── [slug]/
    │       ├── page.tsx
    │       └── aula/[lessonSlug]/page.tsx
    ├── ranking/                       # ❌ (overlap com spec 04)
    │   └── page.tsx
    ├── conquistas/                    # ❌ (overlap com spec 05)
    │   └── page.tsx
    └── perfil/
        ├── page.tsx                   # ✅ mínima (avatar + nome + e-mail)
        └── [userCode]/page.tsx        # ❌ perfil público de outro usuário
```

> Apenas `Home` e `Trilhas` aparecem na navegação do sidebar por enquanto; as demais rotas serão adicionadas conforme as specs 02/04/05 avançam (links inexistentes caem em 404 de propósito).

> **Server Actions** do shell autenticado **não** ficam em `_actions/` dentro de `(app)` — ficam por domínio em `src/lib/<dominio>/actions/` (ex.: `signOutAction` em `src/lib/auth/actions/session.ts`). O helper de sessão é `getSessionUser()` em `src/lib/auth/utils/getSessionUser.ts` (por padrão redireciona para `/login`; `{ require: false }` para versão anulável). Ver `apps/web/CLAUDE.md`.

### Componentes novos no design system

- ✅ `components/avatar/` — `AvatarWrapper`, `AvatarImage` (com fallback de iniciais via `getInitials`), `AvatarFallback`. Stories + testes unitários.
- ✅ `components/layout/` — `app-shell.tsx`, `sidebar.tsx`, `sidebar-user.tsx`, `nav-items.ts`. **Não há `topbar.tsx`/`UserMenu`** — o bloco do usuário (Perfil/Sair) fica no rodapé do sidebar (ver decisão). _Faltam stories + testes destes._
- ✅ `components/icon/` — componente `Icon` central que registra ícones offline (Iconify) e renderiza no SSR sem "piscar". Usar sempre este, não `@iconify/react` direto.
- ❌ `components/streak/streak-badge.tsx` — pendente (depende do backend de streak).
- ❌ `components/activity/activity-list.tsx` — pendente.

Para os novos: stories em `stories/` + testes unitários.

## Tarefas

### Core
- [ ] Migration adicionando `streakCurrent`, `streakBest`, `lastStudyDate` ao `User`.
- [ ] Consumer de `lesson.completed` no Core (parece estranho — Core também consumiria seu próprio evento?). **Alternativa**: criar serviço dedicado de streak, ou adicionar lógica no `progress.service.ts` para atualizar streak **dentro da mesma transação** que conclui a lição (mais simples; sem evento envolvido).
- [ ] gRPC `GetHomeDashboard(userCode)` agregando dados do Core; gateway agrega com Gamification/Achievements.

### Gateway
- [ ] Resolver `home` que faz fan-out paralelo: Core + Gamification + Achievements.
- [ ] Resolver `profile` idem.
- [ ] Cache leve (request-scoped DataLoader) para evitar refazer query nas mesmas chamadas.

### Web
- [x] Criar `app/(app)/layout.tsx` com `<AppShell>`.
- [x] `AppShell` (`components/layout/app-shell.tsx`) com sidebar fixa (drawer no mobile). _Sem header sticky — ver decisão._
- [x] Componentes `Sidebar`, `SidebarUser` (substitui `Topbar`/`UserMenu`), `AvatarWrapper`/`AvatarImage`/`AvatarFallback`.
- [x] Página `/home` (placeholder com saudação). _Falta consumir `query { home }`._
- [x] Página `/perfil` mínima (avatar + nome + e-mail de `/me`). _Falta consumir `query { profile }` e os cards de gamificação._
- [x] Menu do usuário com "Sair" (`signOutAction` → `signOut()` do NextAuth), no rodapé do sidebar.
- [x] `proxy.ts` — sem mudança: a lógica atual "tudo que não é auth/portal é protegido" já cobre `/home` e `/perfil`.
- [ ] `/home` consumindo `query { home }` (dashboard completo: cards de progresso, mascote, próximas aulas).
- [ ] `/perfil` consumindo `query { profile }` (XP/nível, conquistas, tecnologias, histórico) + `/perfil/[userCode]`.
- [ ] `StreakBadge` exibindo `streakCurrent` com ícone de chama.
- [ ] Integrar `RealtimeProvider` (spec 06) dentro do layout autenticado.
- [ ] Stories + testes unitários para os componentes de layout (`Sidebar`, `SidebarUser`, `AppShell`). _Avatar já tem._

## Critérios de aceite

- Logar redireciona para `/home` e renderiza dashboard com nome, XP atual, streak e trilhas matriculadas.
- Concluir uma lição:
  - `streakCurrent` incrementa se for primeiro dia novo, ou se mantém se mesma data.
  - Bloco do usuário (rodapé do sidebar) atualiza XP em real-time (via spec 06).
- `/perfil` mostra dados próprios; `/perfil/<userCode>` mostra perfil público de outro aluno.
- Menu do usuário (rodapé do sidebar) permite "Sair" (chama `signOut()` do NextAuth). ✅
- Layout responsivo: sidebar vira drawer em mobile. ✅

## Decisões adotadas (base do shell)

- **Sem topbar.** Seguindo `home-autenticado.png`, o shell é só sidebar. O bloco do usuário (avatar + nome + menu Perfil/Sair) fica no **rodapé do sidebar**, não num header. O XP/nível, quando o backend existir, entra nesse bloco (linha sob o nome, como no design), não num header.
- **Mobile:** sidebar vira drawer; um botão flutuante (canto superior esquerdo) o abre — não há barra superior.
- **Ícones:** sempre via `components/icon` (registro offline + SSR), nunca `@iconify/react` direto, pra evitar a "piscada" no carregamento.
- **Server Actions por domínio** em `lib/<dominio>/actions/`; helper de sessão `getSessionUser()` com guard embutido. Detalhes em `apps/web/CLAUDE.md`.

## Riscos & decisões em aberto

- **Timezone do streak**: usar UTC inicialmente. Para sentir "natural" para o usuário brasileiro (que estuda à noite), precisamos do timezone no cookie. Iterar.
- **Onde calcular streak**: dentro do Core (mesma transação de `progress`) é a opção mais barata e consistente. Adotada.
- **Perfil público de outros usuários**: precisa de campo `public: boolean` no User? Decisão inicial: **perfil sempre público**, só esconde e-mail.
- **Avatar upload**: armazenamento em CDN não foi planejado; usar URL fornecida pelo provedor OAuth no MVP. Upload de avatar vira spec futura.
