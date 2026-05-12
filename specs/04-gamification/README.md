# 04 — Gamificação (XP & Ranking)

Traduz ações em recompensas. Escuta `lesson.completed`, calcula XP, persiste histórico no Postgres, mantém ranking no Redis (Sorted Set), e publica `xp.rewarded`.

## Status atual

### Backend (`apps/api/apps/gamification`)
- ✅ App NestJS provisionado, com gRPC server e PrismaModule.
- ✅ Schema Prisma: `UserXp(userCode, total)`, `XpTransaction(userCode, amount, reason, sourceId, createdAt)` (`apps/api/apps/gamification/prisma/schema.prisma`).
- ❌ Nenhum consumer AMQP.
- ❌ Nenhuma integração com Redis.
- ❌ Nenhum cálculo de níveis.
- ❌ Nenhum endpoint para o gateway consultar XP/ranking.

### Frontend (`apps/web`)
- ✅ Componentes visuais `BadgeWrapper`, `BadgeIcon`, `BadgeValue`, `ProgressBar` no design system.
- ❌ Nenhuma página/seção mostrando XP, nível ou ranking.

## Escopo

1. Consumer AMQP de `lesson.completed` que credita XP.
2. Regras simples e configuráveis de XP por evento (tabela ou enum em código por enquanto).
3. Sistema de **níveis** baseado em XP acumulado (Leigo → Especialista — ver README do projeto).
4. **Ranking global** em Redis Sorted Set (`ZADD mio:xp:global <total> <userCode>`).
5. Publica `xp.rewarded` para Achievements e Messenger consumirem.
6. APIs gRPC para o gateway consultar XP do usuário, ranking global e top N.

## Contratos

### Tabela de recompensas (versão inicial)

| Evento | XP |
|---|---|
| `lesson.completed` (primeira vez) | 50 |
| `lesson.completed` (repetida — não deve acontecer com idempotência, mas defensivo) | 0 |
| Conquistas (ver spec 05) | varia, **não tratado aqui** |

Reload pode trocar a tabela para um JSON em `apps/gamification/src/rules/xp-rules.json`.

### Níveis

| Nível | XP mínimo |
|---|---|
| Leigo | 0 |
| Iniciante | 100 |
| Júnior | 500 |
| Pleno | 1500 |
| Sênior | 4000 |
| Especialista | 10000 |

Computado on-the-fly (sem coluna persistida) na função `levelFor(totalXp)`.

### gRPC (`apps/api/proto/gamification.proto`)

```proto
syntax = "proto3";
package mio.gamification.v1;

service GamificationService {
  rpc GetUserXp(GetUserXpRequest) returns (UserXpResponse);
  rpc GetLeaderboard(GetLeaderboardRequest) returns (LeaderboardResponse);
}

message GetUserXpRequest { string user_code = 1; }
message UserXpResponse {
  int32 total = 1;
  string level = 2;
  int32 progress_to_next = 3;     // 0..100
  int32 xp_to_next_level = 4;
  int32 rank = 5;                 // posição global (1-based)
}

message GetLeaderboardRequest { int32 limit = 1; int32 offset = 2; }
message LeaderboardEntry { string user_code = 1; string name = 2; string avatar_url = 3; int32 total = 4; int32 rank = 5; }
message LeaderboardResponse { repeated LeaderboardEntry entries = 1; int32 total_users = 2; }
```

### GraphQL

```graphql
type UserXp {
  total: Int!
  level: Level!
  progressToNext: Int!     # 0..100
  xpToNextLevel: Int!
  rank: Int!
}

enum Level { LEIGO INICIANTE JUNIOR PLENO SENIOR ESPECIALISTA }

type LeaderboardEntry {
  userCode: ID!
  name: String!
  avatarUrl: String
  total: Int!
  rank: Int!
}

extend type Query {
  myXp: UserXp!
  leaderboard(limit: Int = 50, offset: Int = 0): [LeaderboardEntry!]!
}
```

### Evento publicado

```json
// routing key: xp.rewarded
{
  "userCode": "abc123",
  "amount": 50,
  "reason": "lesson.completed",
  "sourceId": "lesson:42",
  "totalAfter": 200,
  "level": "INICIANTE",
  "awardedAt": "2026-05-11T20:30:05.000Z"
}
```

### Redis

- Key: `mio:xp:global` (Sorted Set, score = total XP, member = `userCode`).
- Atualização: `ZADD mio:xp:global GT <total> <userCode>` (a flag `GT` evita decremento).
- Leitura ranking: `ZREVRANGE mio:xp:global 0 N WITHSCORES`.
- Posição do usuário: `ZREVRANK mio:xp:global <userCode>`.
- Total: `ZCARD mio:xp:global`.

## Tarefas

### Gamification service
- [ ] `modules/xp/xp.module.ts`, `xp.service.ts`, `xp.controller.ts` (gRPC).
- [ ] `modules/leaderboard/leaderboard.service.ts` interagindo com Redis.
- [ ] Consumer AMQP `LessonCompletedConsumer` (vincula fila `gamification.lesson.completed`).
- [ ] Lógica do consumer:
  1. Idempotência: `XpTransaction.sourceId = "lesson:<id>"` com `@@unique` ⇒ duplicatas são ignoradas.
  2. Inserir `XpTransaction` + atualizar `UserXp.total` em transação.
  3. `ZADD GT` no Redis.
  4. Publicar `xp.rewarded`.
- [ ] Função `levelFor(totalXp)` em `lib/level.ts` + testes unitários.
- [ ] Endpoint gRPC `GetUserXp` lê Postgres + posição do Redis (`ZREVRANK`).
- [ ] Endpoint gRPC `GetLeaderboard` lê do Redis e enriquece com nome/avatar via Core (gRPC `BatchGetUsers` — adicionar em `users.proto`).
- [ ] Atualizar Prisma com `@@unique` em `XpTransaction(userCode, sourceId)`.

### Core
- [ ] Adicionar `BatchGetUsers(codes: [string])` no `users.proto` para o Gamification enriquecer leaderboard (evita chamada N+1).

### Gateway
- [ ] `modules/gamification/gamification.module.ts` com `ClientGrpc`.
- [ ] Resolvers `myXp`, `leaderboard`.

### Web
- [ ] Componente `XpBadge` que mostra nível + ProgressBar do XP atual → próximo nível.
- [ ] Componente `LeaderboardList` (server component, paginado).
- [ ] Página `/ranking` (`app/(app)/ranking/page.tsx`).
- [ ] Integração no header autenticado mostrando `XpBadge` (depende de spec 08).

## Critérios de aceite

- Após `lesson.completed`, em ≤ 2s:
  - `UserXp.total` aumentou em 50.
  - `XpTransaction` registrado com `sourceId="lesson:<id>"`.
  - Score no Redis Sorted Set reflete o novo total.
  - Evento `xp.rewarded` publicado.
- Concluir a mesma lição duas vezes (se o evento for redespachado) **não duplica** XP.
- `query { myXp { total level progressToNext } }` retorna valores coerentes.
- `query { leaderboard(limit: 10) }` retorna lista ordenada decrescentemente.

## Riscos & decisões em aberto

- **Reconstrução do Sorted Set** se Redis cair: criar comando `yarn rebuild-leaderboard` que reescaneia `UserXp` no Postgres e popula o Sorted Set. Plano B aceitável.
- **Anti-cheat** (eventos duplicados ou forjados): idempotência por `sourceId` cobre re-entrega. Forja exige acesso ao RabbitMQ — protegido pela rede interna.
- **Decay de XP / streak bonus**: fora do MVP. Atualmente XP só sobe.
