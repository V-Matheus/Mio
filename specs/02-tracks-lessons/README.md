# 02 — Trilhas & Aulas

Catálogo de conteúdo: trilhas → lições → seções (texto / exercício). É o **dono da verdade do conteúdo** — vive no Core.

## Status atual

### Backend (`apps/api/apps/core`)
- ✅ Schema Prisma já modela `Track`, `Lesson`, `Section`, `Enrollment`, `LessonProgress` (`apps/api/apps/core/prisma/schema.prisma`).
- ✅ Enum `SectionKind { TEXT, EXERCISE }`.
- ❌ Nenhum módulo (`tracks`, `lessons`, `sections`) implementado.
- ❌ Nenhum `.proto` para catálogo.
- ❌ Nenhum seed/fixture inicial.
- ❌ Nenhum loader de conteúdo (texto/markdown vive em filesystem ou DB? — decisão pendente).

### Frontend (`apps/web`)
- ❌ Nenhuma página `/trilhas`, `/trilha/[slug]`, `/aula/[slug]`.
- ❌ Nenhum componente de player de lição.
- ❌ Nenhum renderer de markdown / exercício.

## Escopo

1. CRUD **read-only para o aluno**: listar trilhas, ver detalhe da trilha (com lições), ver detalhe da lição (com seções).
2. Enrollment: aluno se matricula numa trilha (idempotente).
3. Renderização de seções `TEXT` (markdown) e `EXERCISE` (placeholder mínimo — exercício real vira spec própria no futuro).
4. Conteúdo das seções referenciado por `contentPath` — primeira versão: arquivos `.md` em `apps/api/apps/core/content/<track>/<lesson>/<section>.md` lidos do disco.
5. **Sem CMS de admin** nesta fase. Conteúdo entra via seed/migração.

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

### Estrutura de conteúdo

```
apps/api/apps/core/
└── content/
    └── front-end/                        # track slug
        ├── track.json                    # { title, description }
        └── intro-html/                   # lesson slug
            ├── lesson.json               # { title, position }
            └── 01-tags-basicas.md        # section (slug = "tags-basicas", position = 1, kind = TEXT)
```

Script de seed lê essa árvore e popula Postgres na inicialização (`yarn seed:content`).

## Tarefas

### Core
- [ ] Criar `modules/tracks/tracks.module.ts`, `tracks.service.ts`, `tracks.controller.ts` (gRPC).
- [ ] Criar `modules/lessons/lessons.module.ts` (idem) — opcionalmente unificado em `catalog.module.ts`.
- [ ] Criar `modules/enrollments/enrollments.service.ts`.
- [ ] Loader de conteúdo (`content-loader.service.ts`) que lê markdown via `fs.readFile` quando o `Section` é resolvido.
- [ ] Script `scripts/seed-content.ts` que escaneia `apps/core/content/**` e faz upsert no DB.
- [ ] Indices: `Lesson.trackId+position` (já existe), validar `Section.lessonId+position` (já existe).
- [ ] Testes unitários do service e e2e do seed.

### Gateway
- [ ] `modules/catalog/catalog.module.ts` com `ClientGrpc` para `mio.catalog.v1`.
- [ ] Resolvers `tracks`, `track`, `lesson`, `section`, `enrollInTrack`.
- [ ] Guard de auth para `enrollInTrack` (precisa de `userCode`).

### Web
- [ ] Página `/trilhas` (`app/(app)/trilhas/page.tsx`) — server component que chama `tracks` via GraphQL.
- [ ] Página `/trilhas/[slug]` — mostra detalhe + botão "Matricular" se `enrolled === false`.
- [ ] Server Action `enrollInTrackAction(slug)` chamando mutation.
- [ ] Página `/trilhas/[trackSlug]/aula/[lessonSlug]` — layout dividido (sidebar com seções, área principal com conteúdo).
- [ ] Componente `LessonPlayer` (client) gerencia navegação entre seções dentro da lição.
- [ ] Renderer de markdown: `react-markdown` + `rehype-highlight` para code blocks.
- [ ] Placeholder visual de `EXERCISE` (botão "Em breve" — exercício real fica para spec futura).

## Critérios de aceite

- `yarn seed:content` popula Postgres a partir de pelo menos uma trilha em `content/` com 2 lições e 3 seções cada.
- `query { tracks { slug title } }` retorna a trilha seedada.
- Usuário logado consegue se matricular numa trilha pela UI; `enrolled` reflete true na próxima consulta.
- Navegar para `/trilhas/<slug>/aula/<slug>` mostra título da lição, lista de seções e renderiza markdown da seção 1.
- Trocar de seção via sidebar atualiza URL com `?section=<slug>` e renderiza conteúdo correspondente.

## Riscos & decisões em aberto

- **Markdown no DB vs filesystem**: começamos com **filesystem** + git (versionado junto ao código). Mudar para DB só quando houver editor.
- **Exercícios interativos** (executar código no browser): grande escopo — vira spec própria.
- **Trilha rota gating**: aluno pode acessar lição sem estar matriculado? Decisão inicial: **pode ler livremente**; matrícula só ativa progresso/XP.
- **Internacionalização**: schema atual não suporta `locale`. Adicionar `Section.locale` quando virar requisito.
