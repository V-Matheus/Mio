# 04 — Gamificação (XP & Ranking)

Traduz ações em recompensas. Escuta `lesson.completed`, calcula XP de forma dinâmica e idempotente, persiste histórico no Postgres, mantém ranking no Redis (Sorted Set com desempate por timestamp), e publica `xp.rewarded`.

## Status atual

### Backend (`apps/api/apps/gamification`)
- ✅ App NestJS provisionado, com gRPC server e PrismaModule.
- ✅ Schema Prisma: `UserXp(userCode, total)`, `XpTransaction(userCode, amount, reason, sourceId, createdAt)` com `@@unique([userCode, sourceId])`, `XpRule(key, amount, description)` (`apps/api/apps/gamification/prisma/schema.prisma`).
- ✅ Consumer AMQP `LessonCompletedConsumer` herdando da biblioteca compartilhada `@mio/events` (`AmqpConsumerService`).
- ✅ Integração com Redis via biblioteca compartilhada `@mio/redis` (`RedisService`) usando Sorted Set (`mio:xp:global`).
- ✅ Cálculo de níveis (`levelFor(totalXp)`) com 6 faixas de graduação: Leigo, Iniciante, Júnior, Pleno, Sênior e Especialista.
- ✅ Regra de desempate por timestamp (*Score Packing*): $\text{Score} = \text{totalXp} + (1 - \text{timestamp}/10^{13})$.
- ✅ Tabela de regras de XP dinâmicas (`XpRule`) com serviço gerenciador `XpRulesService`.
- ✅ Endpoints gRPC `GetUserXp` e `GetLeaderboard` (com enriquecimento cadastral via `BatchGetUsers` do Core).

### Gateway (`apps/api/apps/gateway`)
- ✅ `GamificationModule` com cliente gRPC `gamificationContract`.
- ✅ `GamificationGatewayService` com mapeamento estrito de erros gRPC para `GraphQLError`.
- ✅ `GamificationResolver` com queries `myXp` (autenticada via JWT) e `leaderboard` (aberta/paginada).

### Frontend (`apps/web`)
- ✅ Componentes visuais `XpBadge`, `XpProgressCard`, `LeaderboardPodium`, `LeaderboardList`, `ProgressBar`.
- ✅ Operações e queries GraphQL (`getMyXpQuery`, `getLeaderboardQuery`) consumindo o Gateway.
- ✅ Página completa de Ranking Global em `/ranking` (`app/(app)/ranking/page.tsx`).
- ✅ Integração no menu lateral da Sidebar (`nav-items.ts`).

---

## Contratos

### Tabela de recompensas (configurável no banco)

| Regra / Chave | XP Padrão | Descrição |
|---|---|---|
| `LESSON_COMPLETED` | 50 | XP concedido ao concluir todas as seções de uma aula |
| `TRACK_COMPLETED` | 200 | XP concedido ao finalizar todas as aulas de uma trilha |
| `SECTION_COMPLETED` | 10 | XP concedido ao concluir a leitura de uma seção |
| `EXERCISE_COMPLETED` | 25 | XP concedido ao resolver um exercício prático |

### Níveis

| Nível | XP mínimo |
|---|---|
| Leigo | 0 |
| Iniciante | 100 |
| Júnior | 500 |
| Pleno | 1500 |
| Sênior | 4000 |
| Especialista | 10000 |

### gRPC (`packages/grpc-contracts/proto/gamification.proto`)

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
  int32 rank = 5;                 // posição global (1-based, 0 se sem rank)
}

message GetLeaderboardRequest { int32 limit = 1; int32 offset = 2; }
message LeaderboardEntry { string user_code = 1; string name = 2; string avatar_url = 3; int32 total = 4; int32 rank = 5; string level = 6; }
message LeaderboardResponse { repeated LeaderboardEntry entries = 1; int32 total_users = 2; }
```

### GraphQL (`packages/graphql-schema/schema.gql`)

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
  level: String!
}

extend type Query {
  myXp: UserXp!
  leaderboard(limit: Int = 50, offset: Int = 0): [LeaderboardEntry!]!
}
```

---

## Checklist de Tarefas

### Gamification service
- [x] `modules/xp/xp.module.ts`, `xp.service.ts`, `xp.controller.ts` (gRPC).
- [x] `modules/leaderboard/leaderboard.service.ts` com Redis Sorted Set (`@mio/redis`).
- [x] Consumer AMQP `LessonCompletedConsumer` vinculado à fila `gamification.lesson.completed`.
- [x] Lógica do consumer:
  1. Idempotência: `XpTransaction.sourceId = "lesson:<id>"` com `@@unique([userCode, sourceId])`.
  2. Inserir `XpTransaction` + atualizar `UserXp.total` em transação atômica.
  3. `ZADD GT` no Redis com desempate por timestamp.
  4. Publicar `xp.rewarded` no Outbox.
- [x] Função `levelFor(totalXp)` em `level.ts` + testes unitários.
- [x] Endpoint gRPC `GetUserXp` lê Postgres + posição do Redis (`ZREVRANK`).
- [x] Endpoint gRPC `GetLeaderboard` lê do Redis e enriquece com nome/avatar via Core (gRPC `BatchGetUsers`).
- [x] Tabela `XpRule` e `XpRulesService` para configuração dinâmica de valores de XP.
- [x] Scripts de seed de regras e alunos demo (`seed:gamification`, `seed:all`).

### Core
- [x] Adicionar `BatchGetUsers(codes: [string])` no `users.proto` e `UsersService` para o Gamification enriquecer o ranking sem N+1 queries.

### Gateway
- [x] `modules/gamification/gamification.module.ts` com `ClientGrpc` e `gamificationContract`.
- [x] Resolvers `myXp` e `leaderboard`.
- [x] Mapeamento padronizado de erros de domínio com `GraphQLError`.

### Web
- [x] Componente `XpBadge` que mostra nível e total de XP.
- [x] Componente `XpProgressCard` com barra de progresso para a próxima graduação.
- [x] Componente `LeaderboardPodium` (Top 3 destacados com medalhas/troféus).
- [x] Componente `LeaderboardList` (tabela de classificação com destaque para o usuário logado).
- [x] Página `/ranking` (`app/(app)/ranking/page.tsx`).
- [x] Item "Ranking" adicionado ao menu lateral (`nav-items.ts`).

---

## Critérios de aceite validados

- ✅ Concluir uma lição credita o XP correspondente e emite evento `xp.rewarded`.
- ✅ Reentregas de mensagens no RabbitMQ não duplicam pontos de experiência (idempotência garantida).
- ✅ `query { myXp }` retorna XP acumulado, nível, progresso percentual e posição no ranking em tempo real.
- ✅ `query { leaderboard }` retorna a lista de alunos ordenada com desempate por tempo e enriquecida com dados cadastrais sem queries N+1.
- ✅ A página `/ranking` renderiza o pódio dos 3 primeiros e a tabela geral completa com 100% de cobertura de testes.
