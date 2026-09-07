# 05 — Conquistas (Achievements)

Validador de regras de troféus. Escuta `lesson.completed` e `xp.rewarded`, avalia regras e publica `achievement.unlocked`.

> [!NOTE]
> **Dependência Artística**:
> O valor pedagógico e o apelo emocional das conquistas dependem substancialmente de sua identidade visual (ilustrações exclusivas, insígnias temáticas e medalhas customizadas). Sem artes dedicadas, o módulo usa um ícone genérico (medalha) em grayscale quando a conquista está bloqueada — funcional, mas sem o fator de engajamento pleno até que as ilustrações estejam disponíveis.
> **Status de Execução:** Implementado (ver release [`docs/RELEASE_07-09-2026.md`](../../docs/RELEASE_07-09-2026.md)). Identidade visual definitiva permanece como pendência artística.

## Status atual

### Backend (`apps/api/apps/achievements`)
- ✅ App NestJS provisionado com gRPC server + PrismaModule.
- ✅ Schema Prisma: `Achievement(slug, title, description, iconUrl, ruleType, threshold, xpReward)`, `UserAchievement(userCode, achievementId, unlockedAt)`, `UserCounter`, `OutboxEvent`.
- ✅ Consumers AMQP: `LessonCompletedConsumer` (`lesson.completed`) e `XpRewardedConsumer` (`xp.rewarded`).
- ✅ Motor de regras (`RulesEngineService`) com `LESSONS_COMPLETED`, `TOTAL_XP` e `STREAK_DAYS`, idempotente via `@@unique([userCode, achievementId])`.
- ✅ Seed inicial de conquistas (`scripts/seed-achievements.ts`), incluindo as de sequência (streak).
- ✅ gRPC `ListAchievements`/`GetUserAchievements` paginados (`limit`/`offset`, `total`/`unlockedTotal`).
- ✅ Gamification credita o `xpReward` via `AchievementUnlockedConsumer` (decisão B do spec), idempotente por `sourceId`.

### Frontend (`apps/web`)
- ✅ Conquistas integradas ao perfil do aluno (`AchievementsSection`), sem rota dedicada — por decisão de produto.
- ✅ Modal com listagem completa em grid de 2 colunas e scroll infinito (`IntersectionObserver` + Server Action).
- ❌ Nenhum modal de "Conquista desbloqueada!" em tempo real (depende do Messenger SSE, spec 06).

## Escopo

1. Modelar regras simples por `ruleType + threshold`:
   - `LESSONS_COMPLETED` — quantas lições o usuário concluiu (e.g., 1, 10, 50).
   - `TOTAL_XP` — XP acumulado atinge limite (e.g., 100, 500, 1000).
   - Outros tipos viram extensões.
2. Consumer AMQP de `lesson.completed` (atualiza contador por usuário, dispara regras `LESSONS_COMPLETED`).
3. Consumer AMQP de `xp.rewarded` (dispara regras `TOTAL_XP` usando `totalAfter`).
4. Publicar `achievement.unlocked`.
5. Seed inicial com 8-12 conquistas.
6. APIs gRPC para listar conquistas e progresso do usuário.

## Contratos

### Prisma (extensão)

```prisma
model Achievement {
  id          BigInt   @id @default(autoincrement())
  slug        String   @unique
  title       String
  description String
  iconUrl     String?
  ruleType    String   // "LESSONS_COMPLETED" | "TOTAL_XP"
  threshold   Int
  xpReward    Int      @default(0)   // XP extra ao desbloquear (NÃO publicado aqui — apenas registrado; quem credita XP é gamification?)
  createdAt   DateTime @default(now())

  unlocks UserAchievement[]
}

model UserAchievement {
  id            BigInt   @id @default(autoincrement())
  userCode      String
  achievementId BigInt
  unlockedAt    DateTime @default(now())

  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userCode, achievementId])
  @@index([userCode])
}

model UserCounter {
  userCode      String
  counter       String     // "lessons_completed"
  value         Int        @default(0)
  updatedAt     DateTime   @updatedAt

  @@id([userCode, counter])
}
```

### gRPC (`apps/api/proto/achievements.proto`)

```proto
syntax = "proto3";
package mio.achievements.v1;

service AchievementsService {
  rpc ListAchievements(ListAchievementsRequest) returns (AchievementsResponse);
  rpc GetUserAchievements(GetUserAchievementsRequest) returns (UserAchievementsResponse);
}

message ListAchievementsRequest {}
message Achievement {
  string slug = 1;
  string title = 2;
  string description = 3;
  string icon_url = 4;
  string rule_type = 5;
  int32 threshold = 6;
}
message AchievementsResponse { repeated Achievement achievements = 1; }

message GetUserAchievementsRequest { string user_code = 1; }
message UserAchievementEntry {
  string slug = 1;
  string title = 2;
  string description = 3;
  string icon_url = 4;
  bool unlocked = 5;
  string unlocked_at = 6;  // ISO ou vazio
  int32 progress = 7;       // 0..threshold
  int32 threshold = 8;
}
message UserAchievementsResponse { repeated UserAchievementEntry entries = 1; }
```

### GraphQL

```graphql
type Achievement {
  slug: ID!
  title: String!
  description: String!
  iconUrl: String
  ruleType: String!
  threshold: Int!
}

type UserAchievement {
  slug: ID!
  title: String!
  description: String!
  iconUrl: String
  unlocked: Boolean!
  unlockedAt: String
  progress: Int!
  threshold: Int!
}

extend type Query {
  achievements: [Achievement!]!
  myAchievements: [UserAchievement!]!
}
```

### Evento publicado

```json
// routing key: achievement.unlocked
{
  "userCode": "abc123",
  "achievementSlug": "first-lesson",
  "title": "Primeiro passo",
  "iconUrl": "https://cdn.mio/achievements/first-lesson.png",
  "unlockedAt": "2026-05-11T20:30:06.000Z"
}
```

### Conquistas iniciais (seed)

| slug | title | ruleType | threshold |
|---|---|---|---|
| `first-lesson` | Primeiro passo | LESSONS_COMPLETED | 1 |
| `ten-lessons` | Maratonista | LESSONS_COMPLETED | 10 |
| `fifty-lessons` | Veterano | LESSONS_COMPLETED | 50 |
| `xp-100` | Acendendo a chama | TOTAL_XP | 100 |
| `xp-500` | Em chamas | TOTAL_XP | 500 |
| `xp-1000` | Imparável | TOTAL_XP | 1000 |
| `xp-5000` | Fênix | TOTAL_XP | 5000 |

## Tarefas

### Achievements service
- [ ] Migration adicionando `xpReward` em `Achievement` e nova tabela `UserCounter`.
- [ ] `modules/rules/rules.module.ts` com `RulesEngine` que dado `(userCode, event)` resolve quais conquistas avaliar.
- [ ] `LessonCompletedConsumer`:
  1. `INCR` em `UserCounter(userCode, "lessons_completed")` (transação).
  2. Buscar achievements `ruleType = LESSONS_COMPLETED` com `threshold <= counter` que ainda **não** estão em `UserAchievement` do usuário.
  3. Para cada, inserir `UserAchievement` (com `@@unique` para idempotência) e publicar `achievement.unlocked`.
- [ ] `XpRewardedConsumer`:
  1. Ler `totalAfter` do payload.
  2. Buscar achievements `ruleType = TOTAL_XP` com `threshold <= totalAfter` ainda não desbloqueados.
  3. Mesmo fluxo de inserção + publicação.
- [ ] Seed inicial em `scripts/seed-achievements.ts`.
- [ ] gRPC `ListAchievements`, `GetUserAchievements` (com cálculo de `progress` consultando `UserCounter`/`UserXp` — esse último via gRPC para Gamification).

### Gateway
- [ ] `modules/achievements/achievements.module.ts` + resolvers `achievements`, `myAchievements`.

### Web
- [ ] Componente `AchievementCard` (locked vs unlocked com `grayscale`).
- [ ] Página `/conquistas` (server component que chama `myAchievements`).
- [ ] Modal/toast "Conquista desbloqueada" — virá em tempo real via Messenger (ver spec 06); como fallback inicial, mostra ao revalidar a tela após concluir uma lição.

## Critérios de aceite

- Após o primeiro `lesson.completed`, em ≤ 2s:
  - `UserCounter(userCode, "lessons_completed").value` = 1.
  - `UserAchievement(slug="first-lesson")` registrado.
  - Evento `achievement.unlocked` publicado uma única vez.
- Reentregar o mesmo `lesson.completed`: contador não duplica (depende da idempotência do evento — ver outbox spec 03).
- `query { myAchievements }` mostra `progress=1, threshold=1, unlocked=true` para `first-lesson` e `progress=1, threshold=10, unlocked=false` para `ten-lessons`.

## Riscos & decisões em aberto

- **XP por conquista**: campo `xpReward` está no schema, mas **quem credita** o XP? Opções:
  - A) Achievements publica `xp.rewarded` direto (vira producer de XP) — quebra a separação.
  - B) Gamification escuta `achievement.unlocked` e credita XP correspondente.
  - **Decisão sugerida: B**. Achievements não emite XP, apenas a conquista.
- **Idempotência do counter `UserCounter`**: pré-condição é que `lesson.completed` não chegue duplicado. Outbox cuida disso. Para defesa extra: armazenar `processedEventIds` (set Redis com TTL).
- **Regras compostas** (ex.: "complete 5 lições em 3 dias seguidos"): fora do MVP. `ruleType` é extensível.
- **Limitação artística e timing de lançamento**: a entrega visual depende de assets gráficos dedicados (ilustrações das medalhas). O desenvolvimento do serviço foi deixado em espera ativa para não criar uma experiência puramente baseada em ícones neutros, direcionando a capacidade técnica atual para o feedback de XP em tempo real (SSE).
