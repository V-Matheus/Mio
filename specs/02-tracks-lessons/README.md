# 02 — Trilhas & Aulas

Catálogo de conteúdo: trilhas → lições → seções (texto / exercício). É o **dono da verdade do conteúdo** — vive no Core.

## Status atual

### Backend (`apps/api/apps/core`)
- ✅ Schema Prisma já modela `Track`, `Lesson`, `Section`, `Enrollment`, `LessonProgress` (`apps/api/apps/core/prisma/schema.prisma`).
- ✅ Enum `SectionKind { TEXT, EXERCISE }`.
- ✅ Módulo `catalog` unificado (`modules/catalog/`): tracks + lessons + enrollments.
- ✅ `catalog.proto` (`mio.catalog.v1`) em `@mio/grpc-contracts` (`src/catalog/`).
- ✅ Conteúdo das seções no **Postgres** (`Section.contentMarkdown`) — markdown é formato de edição/renderização, nunca armazenamento em arquivo.
- ✅ Seed `yarn seed:content` com fixtures inline (`apps/core/scripts/seed-fixtures.ts`) — trilha inicial `front-end`.
- ✅ Gateway expõe queries `tracks/track/lesson/section` e mutation `enrollInTrack` (schema.gql regenerado).

### Frontend (`apps/web`)
- ❌ Nenhuma página `/trilhas`, `/trilha/[slug]`, `/aula/[slug]`.
- ❌ Nenhum componente de player de lição.
- ❌ Nenhum renderer de markdown / exercício.

## Escopo

1. CRUD **read-only para o aluno**: listar trilhas, ver detalhe da trilha (com lições), ver detalhe da lição (com seções).
2. Enrollment: aluno se matricula numa trilha (idempotente).
3. Renderização de seções `TEXT` (markdown) e `EXERCISE` (placeholder mínimo — exercício real vira spec própria no futuro).
4. Conteúdo das seções em `Section.contentMarkdown` (`TEXT` no Postgres) — o banco é a fonte da verdade. Nesta fase o conteúdo entra via seed (`yarn seed:content`, fixtures inline); depois, pela interface de admin ([spec 09](../09-admin-content/)).
5. **Sem CMS de admin** nesta fase (vira a [spec 09](../09-admin-content/)). Conteúdo entra via seed/migração.

## Contratos

### gRPC (`apps/api/proto/catalog.proto`)

```proto
syntax = "proto3";
package mio.catalog.v1;

service CatalogService {
  rpc ListTracks(ListTracksRequest) returns (TracksResponse);
  rpc GetTrack(GetTrackRequest) returns (TrackDetailResponse);
  rpc GetLesson(GetLessonRequest) returns (LessonDetailResponse);
  rpc GetSection(GetSectionRequest) returns (SectionDetailResponse);
  rpc EnrollUser(EnrollUserRequest) returns (EnrollmentResponse);
}

message ListTracksRequest { string user_code = 1; } // user_code opcional pra marcar matrícula
message Track { string slug = 1; string title = 2; string description = 3; int32 lesson_count = 4; bool enrolled = 5; }
message TracksResponse { repeated Track tracks = 1; }

message GetTrackRequest { string slug = 1; string user_code = 2; }
message LessonSummary { string slug = 1; string title = 2; int32 position = 3; bool completed = 4; }
message TrackDetailResponse {
  string slug = 1;
  string title = 2;
  string description = 3;
  repeated LessonSummary lessons = 4;
  bool enrolled = 5;
}

message GetLessonRequest { string track_slug = 1; string lesson_slug = 2; string user_code = 3; }
message SectionSummary { string slug = 1; string title = 2; int32 position = 3; string kind = 4; bool completed = 5; }
message LessonDetailResponse {
  string track_slug = 1;
  string lesson_slug = 2;
  string title = 3;
  repeated SectionSummary sections = 4;
}

message GetSectionRequest { string track_slug = 1; string lesson_slug = 2; string section_slug = 3; }
message SectionDetailResponse {
  string slug = 1;
  string title = 2;
  string kind = 3;          // "TEXT" | "EXERCISE"
  string content_markdown = 4;
}

message EnrollUserRequest { string user_code = 1; string track_slug = 2; }
message EnrollmentResponse { bool ok = 1; }
```

### GraphQL (gateway)

```graphql
type Track {
  slug: ID!
  title: String!
  description: String
  lessonCount: Int!
  enrolled: Boolean!
}

type LessonSummary {
  slug: ID!
  title: String!
  position: Int!
  completed: Boolean!
}

type TrackDetail {
  slug: ID!
  title: String!
  description: String
  lessons: [LessonSummary!]!
  enrolled: Boolean!
}

type SectionSummary {
  slug: ID!
  title: String!
  position: Int!
  kind: SectionKind!
  completed: Boolean!
}

enum SectionKind { TEXT EXERCISE }

type LessonDetail {
  trackSlug: ID!
  lessonSlug: ID!
  title: String!
  sections: [SectionSummary!]!
}

type SectionDetail {
  slug: ID!
  title: String!
  kind: SectionKind!
  contentMarkdown: String!
}

extend type Query {
  tracks: [Track!]!
  track(slug: ID!): TrackDetail
  lesson(trackSlug: ID!, lessonSlug: ID!): LessonDetail
  section(trackSlug: ID!, lessonSlug: ID!, sectionSlug: ID!): SectionDetail
}

extend type Mutation {
  enrollInTrack(trackSlug: ID!): Boolean!
}
```

### Conteúdo inicial (fixtures de seed)

O conteúdo de desenvolvimento/demonstração vive em `apps/api/apps/core/scripts/seed-fixtures.ts` como dados TypeScript (`TrackEntry[]`): cada trilha declara lições e seções com `slug`, `title`, `position`, `kind` e o `contentMarkdown` inline (template literal). `yarn seed:content` (ou `yarn docker:seed:content` no container) faz upsert idempotente no Postgres — reordenações são seguras e entradas removidas das fixtures geram apenas warning (não são apagadas, preservando progresso/matrículas).

Não existem arquivos de aula no repo nem em runtime: em produção o conteúdo será criado/editado pela interface de admin (spec 09) direto no banco.

## Tarefas

### Core
- [x] Criar módulos de tracks/lessons — **unificados em `modules/catalog/`** (`catalog.module.ts` + `catalog.controller.ts` gRPC + `tracks.service.ts` + `lessons.service.ts`).
- [x] Criar `enrollments.service.ts` (no módulo catalog; matrícula idempotente via upsert).
- [x] Conteúdo no banco: `Section.contentMarkdown` (`TEXT`), servido direto pelo `lessons.service.ts` — sem loader de filesystem.
- [x] Script `apps/core/scripts/seed-content.ts` que faz upsert das fixtures de `seed-fixtures.ts` no DB (`yarn seed:content` / `yarn docker:seed:content`; reordenação segura, órfãos só geram warning).
- [x] Indices: `Lesson.trackId+position` (já existe), validar `Section.lessonId+position` (já existe).
- [x] Testes unitários dos services e do seed (validação de fixtures + sync).
- [ ] e2e do seed contra Postgres real no CI (validado manualmente; falta infra de DB no pipeline de teste).

### Gateway
- [x] `modules/catalog/catalog.module.ts` com `ClientGrpc` para `mio.catalog.v1`.
- [x] Resolvers `tracks`, `track`, `lesson`, `section`, `enrollInTrack` (queries de detalhe devolvem `null` para not-found, conforme schema).
- [x] Guard de auth para `enrollInTrack` (`GqlAuthGuard`); queries usam `OptionalGqlAuthGuard` — `userCode` opcional só personaliza `enrolled`/`completed`.

### Web
- [ ] Página `/trilhas` (`app/(app)/trilhas/page.tsx`) — server component que chama `tracks` via GraphQL.
- [ ] Página `/trilhas/[slug]` — mostra detalhe + botão "Matricular" se `enrolled === false`.
- [ ] Server Action `enrollInTrackAction(slug)` chamando mutation.
- [ ] Página `/trilhas/[trackSlug]/aula/[lessonSlug]` — layout dividido (sidebar com seções, área principal com conteúdo).
- [ ] Componente `LessonPlayer` (client) gerencia navegação entre seções dentro da lição.
- [ ] Renderer de markdown: `react-markdown` + `rehype-highlight` para code blocks.
- [ ] Placeholder visual de `EXERCISE` (botão "Em breve" — exercício real fica para spec futura).

## Critérios de aceite

- `yarn seed:content` popula Postgres a partir das fixtures com pelo menos uma trilha de 2 lições e 3 seções cada.
- `query { tracks { slug title } }` retorna a trilha seedada.
- Usuário logado consegue se matricular numa trilha pela UI; `enrolled` reflete true na próxima consulta.
- Navegar para `/trilhas/<slug>/aula/<slug>` mostra título da lição, lista de seções e renderiza markdown da seção 1.
- Trocar de seção via sidebar atualiza URL com `?section=<slug>` e renderiza conteúdo correspondente.

## Riscos & decisões em aberto

- **Markdown no DB vs filesystem** — ✅ **decidido: DB** (`Section.contentMarkdown`). Aulas nunca entram via git/deploy: serão criadas por professores/admins pela interface (spec 09), e escrita em disco de container é efêmera e sem transação com a row. Markdown segue como **formato** de edição/renderização; a escolha do editor (markdown puro vs editor rico) fica para a spec 09.
- **Exercícios interativos** (executar código no browser): grande escopo — vira spec própria.
- **Trilha rota gating**: aluno pode acessar lição sem estar matriculado? Decisão inicial: **pode ler livremente**; matrícula só ativa progresso/XP.
- **Internacionalização**: schema atual não suporta `locale`. Adicionar `Section.locale` quando virar requisito.
