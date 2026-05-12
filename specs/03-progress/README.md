# 03 — Progresso

Registrar avanço do aluno: última seção vista, seção concluída, lição concluída. Cada conclusão de lição **publica `lesson.completed`** — gatilho do loop de gamificação e conquistas.

## Status atual

### Backend (`apps/api/apps/core`)
- ✅ Schema Prisma já modela `LessonProgress(userId, lessonId, lastSectionId, completedAt)` (`apps/api/apps/core/prisma/schema.prisma`).
- ❌ Nenhum módulo `progress`.
- ❌ Nenhum publisher do evento `lesson.completed`.

### Frontend (`apps/web`)
- ❌ Nenhuma Server Action `markSectionDoneAction` / `markLessonDoneAction`.
- ❌ Nenhum botão "Concluir seção" no `LessonPlayer`.

## Escopo

1. Mutation **idempotente** para marcar seção como vista (`markSectionViewed`).
2. Mutation **idempotente** para marcar lição como concluída (`markLessonCompleted`).
3. Regra de auto-conclusão: marcar a última seção como vista **conclui a lição automaticamente** (atomicamente, na mesma transação).
4. Publicar evento `lesson.completed` no RabbitMQ **na mesma transação** (outbox pattern simplificado).
5. UI atualiza `LessonPlayer` para mostrar quais seções já estão verdes e oferece o botão "Próxima" que avança e marca como vista.

## Contratos

### gRPC (extensão de `catalog.proto` ou novo `progress.proto`)

```proto
syntax = "proto3";
package mio.progress.v1;

service ProgressService {
  rpc MarkSectionViewed(MarkSectionViewedRequest) returns (ProgressResponse);
  rpc MarkLessonCompleted(MarkLessonCompletedRequest) returns (ProgressResponse);
  rpc GetLessonProgress(GetLessonProgressRequest) returns (LessonProgressResponse);
}

message MarkSectionViewedRequest {
  string user_code = 1;
  string track_slug = 2;
  string lesson_slug = 3;
  string section_slug = 4;
}

message MarkLessonCompletedRequest {
  string user_code = 1;
  string track_slug = 2;
  string lesson_slug = 3;
}

message GetLessonProgressRequest {
  string user_code = 1;
  string track_slug = 2;
  string lesson_slug = 3;
}

message ProgressResponse {
  bool ok = 1;
  bool lesson_completed = 2;   // true se essa ação concluiu a lição
}

message LessonProgressResponse {
  string last_section_slug = 1;
  string completed_at = 2;       // ISO-8601, vazio se não concluída
  repeated string viewed_section_slugs = 3;
}
```

### GraphQL

```graphql
type LessonProgress {
  lastSectionSlug: ID
  completedAt: String
  viewedSectionSlugs: [ID!]!
}

extend type Query {
  lessonProgress(trackSlug: ID!, lessonSlug: ID!): LessonProgress!
}

extend type Mutation {
  markSectionViewed(trackSlug: ID!, lessonSlug: ID!, sectionSlug: ID!): MarkSectionResult!
  markLessonCompleted(trackSlug: ID!, lessonSlug: ID!): Boolean!
}

type MarkSectionResult {
  ok: Boolean!
  lessonCompleted: Boolean!
}
```

### Evento publicado

```json
// routing key: lesson.completed
{
  "userCode": "abc123",
  "trackSlug": "front-end",
  "lessonSlug": "intro-html",
  "lessonId": "42",
  "trackId": "1",
  "completedAt": "2026-05-11T20:30:00.000Z"
}
```

**Cabeçalhos**: `x-event-version: 1`, `content-type: application/json`.

### Modelo de dados

`LessonProgress` já existe. Vamos adicionar **viewedSections** porque precisamos saber quais seções já foram vistas (não só a última):

```prisma
model SectionView {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt
  sectionId BigInt
  viewedAt  DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  section Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  @@unique([userId, sectionId])
}
```

Outbox simples para publicação atômica:

```prisma
model OutboxEvent {
  id          BigInt    @id @default(autoincrement())
  routingKey  String
  payload     Json
  headers     Json?
  createdAt   DateTime  @default(now())
  publishedAt DateTime?

  @@index([publishedAt])
}
```

Worker em background lê `OutboxEvent where publishedAt is null` e publica → marca `publishedAt`.

## Tarefas

### Core
- [ ] Migration adicionando `SectionView` e `OutboxEvent`.
- [ ] Atualizar schema de `User` e `Section` com as relações inversas.
- [ ] `modules/progress/progress.module.ts`, `progress.service.ts`, `progress.controller.ts` (gRPC).
- [ ] Transação Prisma atômica para `markSectionViewed`:
  1. `upsert` `SectionView`.
  2. `upsert` `LessonProgress.lastSectionId`.
  3. Se for última seção: setar `completedAt`, criar `OutboxEvent('lesson.completed', payload)`.
- [ ] Idempotência: re-execuções com o mesmo `sectionSlug` não duplicam eventos (cheque `LessonProgress.completedAt` antes de criar outbox).
- [ ] Worker `OutboxPublisher` (`@Interval(2000)`) que envia eventos pendentes via `EventBus`.
- [ ] Testes unitários e e2e (com worker desligado e disparando manualmente).

### Gateway
- [ ] `modules/progress/progress.module.ts` com `ClientGrpc`.
- [ ] Resolvers `markSectionViewed`, `markLessonCompleted`, `lessonProgress`.
- [ ] Guard de auth em todos.

### Web
- [ ] Server Actions `markSectionViewedAction` e `markLessonCompletedAction` em `app/(app)/_actions/progress.ts`.
- [ ] No `LessonPlayer` (spec 02), botão "Próxima seção" chama `markSectionViewedAction` e navega.
- [ ] Quando `lessonCompleted === true`, exibir tela/modal de "Aula concluída! XP a caminho..." (UI temporária, virá real-time depois — ver spec 06).
- [ ] `revalidatePath` para `/trilhas/[slug]` para que a próxima leitura mostre o progresso atualizado.

## Critérios de aceite

- Clicar "Próxima" na última seção:
  1. Cria `SectionView` da última seção.
  2. Seta `LessonProgress.completedAt`.
  3. Insere `OutboxEvent`.
  4. Worker publica `lesson.completed` no RabbitMQ em ≤ 5s.
- Repetir a ação **não publica** novo evento (`completedAt` já preenchido).
- `query { lessonProgress(...) }` reflete o estado correto entre acessos.
- RabbitMQ Management mostra a mensagem chegando na fila do consumidor `gamification` e `achievements`.

## Riscos & decisões em aberto

- **Outbox + worker** vs **publish dentro da transação**: outbox elimina o problema de "salvou no banco mas evento falhou". Custo: latência de 1-2s. Aceitável.
- **Concluir lição sem ver todas as seções**: regra inicial é **bloqueada** (lição só conclui se todas as seções foram vistas). Adicionar override do admin futuramente.
- **Idempotência distribuída**: se dois requests concorrentes marcarem a mesma seção, o `@@unique([userId, sectionId])` resolve. Atenção ao bloqueio de transação na hora de checar "é a última seção".
