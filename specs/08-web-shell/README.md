# 08 — Web Shell autenticado

Layout, navegação e telas pessoais do usuário logado: `/home`, `/perfil`, streak, navbar, sidebar, integração com XP/conquistas vindas do real-time.

## Status atual

### Frontend (`apps/web`)
- ✅ Landing pública em `app/(portal)/` com header + footer.
- ✅ Fluxo de auth em `app/(auth)/` (login, cadastro, recuperar senha).
- ✅ `proxy.ts` redireciona logado → `/home` e anônimo → `/login`.
- ✅ Design system base (button, card, input, gamification badges, progress bar).
- ❌ Nenhuma rota `/home` (proxy redireciona, mas o destino quebra com 404).
- ❌ Nenhum route group `(app)` para rotas autenticadas.
- ❌ Nenhum layout autenticado.
- ❌ Nenhum componente de navbar/sidebar interna.
- ❌ Nenhuma página de perfil.
- ❌ Nenhuma exibição de streak.

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
app/
├── (portal)/                          # ✅ existente — público
├── (auth)/                            # ✅ existente
└── (app)/                             # ❌ a criar
    ├── layout.tsx                     # AppShell (sidebar + header)
    ├── home/
    │   └── page.tsx
    ├── trilhas/                       # (overlap com spec 02)
    │   ├── page.tsx
    │   └── [slug]/
    │       ├── page.tsx
    │       └── aula/[lessonSlug]/page.tsx
    ├── ranking/                       # (overlap com spec 04)
    │   └── page.tsx
    ├── conquistas/                    # (overlap com spec 05)
    │   └── page.tsx
    └── perfil/
        ├── page.tsx                   # próprio perfil
        └── [userCode]/page.tsx        # perfil público de outro usuário
```

### Componentes novos no design system

- `app/components/avatar/` — `AvatarWrapper`, `AvatarImage`, `AvatarFallback`.
- `app/components/layout/sidebar.tsx`, `app/components/layout/topbar.tsx`, `app/components/layout/app-shell.tsx`.
- `app/components/streak/streak-badge.tsx`.
- `app/components/activity/activity-list.tsx`.

Para todos: stories em `stories/` + testes unitários.

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
- [ ] Criar `app/(app)/layout.tsx` com `<AppShell>`.
- [ ] `AppShell` (`app/components/layout/app-shell.tsx`) com sidebar fixa + header sticky.
- [ ] Componentes `Sidebar`, `Topbar`, `UserMenu`, `AvatarWrapper`.
- [ ] Página `/home` consumindo `query { home }`.
- [ ] Página `/perfil` consumindo `query { profile }`.
- [ ] `StreakBadge` exibindo `streakCurrent` com ícone de chama.
- [ ] Integrar `RealtimeProvider` (spec 06) dentro do layout autenticado.
- [ ] Atualizar `proxy.ts` para incluir as novas rotas em `PROTECTED_ROUTES` (ou continuar com a lógica de "tudo que não é auth/portal é protegido").
- [ ] Stories + testes unitários para os novos componentes.

## Critérios de aceite

- Logar redireciona para `/home` e renderiza dashboard com nome, XP atual, streak e trilhas matriculadas.
- Concluir uma lição:
  - `streakCurrent` incrementa se for primeiro dia novo, ou se mantém se mesma data.
  - Header atualiza XP em real-time (via spec 06).
- `/perfil` mostra dados próprios; `/perfil/<userCode>` mostra perfil público de outro aluno.
- Menu do usuário no header permite "Sair" (chama `signOut()` do NextAuth).
- Layout responsivo: sidebar vira drawer em mobile.

## Riscos & decisões em aberto

- **Timezone do streak**: usar UTC inicialmente. Para sentir "natural" para o usuário brasileiro (que estuda à noite), precisamos do timezone no cookie. Iterar.
- **Onde calcular streak**: dentro do Core (mesma transação de `progress`) é a opção mais barata e consistente. Adotada.
- **Perfil público de outros usuários**: precisa de campo `public: boolean` no User? Decisão inicial: **perfil sempre público**, só esconde e-mail.
- **Avatar upload**: armazenamento em CDN não foi planejado; usar URL fornecida pelo provedor OAuth no MVP. Upload de avatar vira spec futura.
