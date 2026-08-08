# 03 — Progresso

Registrar avanço do aluno: última seção vista, seção concluída, lição concluída. Cada conclusão de lição **publica `lesson.completed`** — gatilho do loop de gamificação e conquistas.

## Status atual

### Backend (`apps/api/apps/core`)
- ✅ Schema Prisma modela `LessonProgress`, `SectionView` e `OutboxEvent` (`apps/api/apps/core/prisma/schema.prisma`).
- ✅ Módulo `progress` implementado (`apps/api/apps/core/src/modules/progress/`): `ProgressService`, `ProgressController` (gRPC) e erros de domínio tipados.
- ✅ Transação Prisma atômica para `markSectionViewed`: registra `SectionView`, atualiza `lastSectionId` e auto-conclui a lição quando todas as seções são vistas.
- ✅ Publicação do evento `lesson.completed` via outbox atômica (`OutboxEvent`) com o worker `OutboxPublisherService` (`libs/events/src/outbox-publisher.service.ts`).
- ✅ Testes unitários e de integração cobrindo serviço, controller, erros, outbox e publisher de eventos (`apps/api/apps/core/src/modules/progress/`).

### Gateway (`apps/api/apps/gateway`)
- ✅ Módulo `progress` implementado (`apps/api/apps/gateway/src/modules/progress/`): `ProgressGatewayService`, `ProgressResolver` e DTOs GraphQL.
- ✅ Contrato gRPC `progressContract` (`@mio/grpc-contracts`) integrado via cliente tipado `ProgressServiceClient`.
- ✅ Resolvers `markSectionViewed`, `markLessonCompleted` e query `lessonProgress` protegidos com `GqlAuthGuard`.
- ✅ Testes unitários do gateway (`apps/api/apps/gateway/src/modules/progress/progress.service.test.ts`).

### Frontend (`apps/web`)
- ✅ Server Actions `markSectionViewedAction` e `markLessonCompletedAction` em `apps/web/src/lib/progress/actions/progress.ts`.
- ✅ Cliente e queries GraphQL de progresso em `apps/web/src/lib/progress/service.ts` e `apps/web/src/lib/progress/graphql/`.
- ✅ `LessonPlayer` (`apps/web/src/app/(app)/trilhas/_components/lesson-player.tsx`) integrado com marcação de seções, barra de progresso dinâmica, botões de ação e navegação contextual.
- ✅ Modal de conclusão de aula ("Aula Concluída! 🎉") disparado quando `lessonCompleted === true`.
- ✅ `revalidatePath` em `/trilhas/[slug]` e `/trilhas/[slug]/aula/[lessonSlug]` para sincronização de cache.

## Escopo

1. Mutation **idempotente** para marcar seção como vista (`markSectionViewed`).
2. Mutation **idempotente** para marcar lição como concluída (`markLessonCompleted`).
3. Regra de auto-conclusão: marcar a última seção como vista **conclui a lição automaticamente** (atomicamente, na mesma transação).
4. Publicar evento `lesson.completed` no RabbitMQ **na mesma transação** (outbox pattern com worker).
5. UI atualiza `LessonPlayer` para mostrar quais seções já estão concluídas e oferece navegação com botão de avanço e auto-conclusão.

## Contratos

### gRPC (`packages/grpc-contracts/src/mio/progress/v1/progress.proto`)

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
  int32 section_id = 2;
}

message MarkLessonCompletedRequest {
  string user_code = 1;
  int32 lesson_id = 2;
}

message GetLessonProgressRequest {
  string user_code = 1;
  int32 lesson_id = 2;
}

message ProgressResponse {
  bool ok = 1;
  bool lesson_completed = 2;   // true se essa ação concluiu a lição
}

message LessonProgressResponse {
  int32 last_section_id = 1;
  string completed_at = 2;     // ISO-8601, vazio se não concluída
  repeated int32 viewed_section_ids = 3;
}
```

### GraphQL (`packages/graphql-schema/schema.gql`)

```graphql
type LessonProgress {
  lastSectionId: Int
  completedAt: String
  viewedSectionIds: [Int!]!
}

extend type Query {
  lessonProgress(lessonId: Int!): LessonProgress!
}

extend type Mutation {
  markSectionViewed(sectionId: Int!): MarkSectionResult!
  markLessonCompleted(lessonId: Int!): MarkSectionResult!
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

```prisma
model LessonProgress {
  id            BigInt    @id @default(autoincrement())
  userId        Int
  lessonId      Int
  lastSectionId Int?
  completedAt   DateTime?
  updatedAt     DateTime  @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  lastSection Section? @relation(fields: [lastSectionId], references: [id], onDelete: SetNull)

  @@unique([userId, lessonId])
}

model SectionView {
  id        Int      @id @default(autoincrement())
  userId    Int
  sectionId Int
  viewedAt  DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  section Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  @@unique([userId, sectionId])
  @@index([userId])
  @@index([sectionId])
}

model OutboxEvent {
  id          BigInt    @id @default(autoincrement())
  routingKey  String
  payload     Json
  headers     Json?
  retryCount  Int       @default(0)
  lastError   String?
  createdAt   DateTime  @default(now())
  publishedAt DateTime?

  @@index([publishedAt])
  @@index([publishedAt, retryCount])
}
```

## Tarefas

### Core
- [x] Migration adicionando `SectionView` e `OutboxEvent`.
- [x] Atualizar schema de `User` e `Section` com as relações inversas.
- [x] `modules/progress/progress.module.ts`, `progress.service.ts`, `progress.controller.ts` (gRPC).
- [x] Transação Prisma atômica para `markSectionViewed`:
  1. `upsert` `SectionView`.
  2. `upsert` `LessonProgress.lastSectionId`.
  3. Se todas as seções forem vistas: setar `completedAt`, criar `OutboxEvent('lesson.completed', payload)`.
- [x] Idempotência: re-execuções não duplicam eventos (`completedAt` checado antes de registrar outbox).
- [x] Worker `OutboxPublisherService` (reativo via `trigger()` com fallback periódico por timer e retries) que envia eventos pendentes via RabbitMQ.
- [x] Testes unitários e de integração (`progress.service.test.ts`, `progress.errors.test.ts`, `progress-events.publisher.test.ts`, `outbox-publisher.service.test.ts`).

### Gateway
- [x] `modules/progress/progress.module.ts` com `ClientGrpc`.
- [x] Resolvers `markSectionViewed`, `markLessonCompleted`, `lessonProgress`.
- [x] Guard de auth em todos (`GqlAuthGuard`).
- [x] Testes unitários (`progress.service.test.ts`).

### Web
- [x] Server Actions `markSectionViewedAction` e `markLessonCompletedAction` em `app/(app)/_actions/` / `lib/progress/actions/progress.ts`.
- [x] No `LessonPlayer` (`apps/web/src/app/(app)/trilhas/_components/lesson-player.tsx`), botão "Próxima seção" / "Concluir aula" chama `markSectionViewedAction` e navega.
- [x] Quando `lessonCompleted === true`, exibir modal "Aula Concluída! 🎉" com confirmação de conclusão e feedback de XP a caminho.
- [x] `revalidatePath` para `/trilhas/[slug]` e `/trilhas/[slug]/aula/[lessonSlug]` para que as páginas reflitam o progresso atualizado.

## Critérios de aceite

- Clicar "Concluir aula" / "Marcar como vista" na última seção:
  1. Cria `SectionView` da seção.
  2. Seta `LessonProgress.completedAt`.
  3. Insere `OutboxEvent`.
  4. Worker publica `lesson.completed` no RabbitMQ exchange `mio.events`.
- Repetir a ação **não publica** novo evento (`completedAt` já preenchido).
- `query { lessonProgress(...) }` reflete o estado correto entre acessos.
- RabbitMQ recebe a mensagem na fila dos consumidores subsequentes (`gamification` e `achievements`).

## Decisões arquiteturais

- **Outbox pattern + worker reativo**: a gravação do evento ocorre atomicamente na mesma transação do banco de dados relacional. O worker drena os eventos de forma reativa (`trigger`) e com fallback periódico, garantindo entrega confiável sem lock na resposta síncrona.
- **Auto-conclusão garantida**: a lição é concluída quando todas as suas seções constam em `SectionView`, disparando o evento `lesson.completed` de forma única e idempotente.
- **Idempotência no banco**: a chave única `@@unique([userId, sectionId])` e checagem de `completedAt` evitam contagem duplicada e múltiplos disparos para a mesma aula.
