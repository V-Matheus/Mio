# 09 — Admin & Conteúdo

Perfil de **admin (professor)** criando e editando trilhas, lições e seções **pela interface**, sem git, sem deploy.

> **Premissa central**: o professor tem liberdade total para escrever a aula do jeito que quiser — a experiência de edição é de escrita livre ("como um md") — mas o que ele escreve é **salvo no banco** (`Section.contentMarkdown`), nunca como arquivo. Markdown é formato de edição/renderização; Postgres é armazenamento. Essa decisão foi tomada na [spec 02](../02-tracks-lessons/) e é a fundação desta spec.

## Status atual

### Backend (`apps/api`)
- ✅ Catálogo read-only implementado (spec 02): `mio.catalog.v1`, módulo `catalog` no Core, conteúdo em `Section.contentMarkdown`.
- ✅ Seed de fixtures para dev (`yarn seed:content`) — vira ferramenta só de desenvolvimento quando o CRUD de admin existir.
- ❌ Nenhum conceito de **role/perfil** no schema (`User` não tem `role`) nem no JWT.
- ❌ Nenhum RPC de escrita no catálogo (só leitura + `EnrollUser`).
- ❌ Nenhum guard de autorização por perfil no gateway.

### Frontend (`apps/web`)
- ❌ Nenhuma área `/admin`.
- ❌ Nenhum editor de conteúdo.

## Escopo

1. **Role admin**: distinguir aluno × admin (professor) na autenticação; expor o perfil no JWT/`me`.
2. CRUD de **trilhas**: criar, editar título/descrição, (des)publicar.
3. CRUD de **lições**: criar dentro de uma trilha, editar título, reordenar posições.
4. CRUD de **seções**: criar dentro de uma lição, editar título/kind, **editar conteúdo** (`contentMarkdown`), reordenar posições.
5. Área `/admin` no Web com as telas de gestão + editor de conteúdo com preview (mesmo renderer de markdown do aluno).
6. **Fora de escopo**: exercícios interativos (spec própria), upload de assets (decisão em aberto abaixo), i18n.

## Contratos (rascunho — refinar antes de codar)

### gRPC (extensão de `catalog.proto` ou novo `catalog-admin.proto`)

```proto
service CatalogAdminService {
  rpc UpsertTrack(UpsertTrackRequest) returns (TrackDetailResponse);
  rpc UpsertLesson(UpsertLessonRequest) returns (LessonDetailResponse);
  rpc UpsertSection(UpsertSectionRequest) returns (SectionDetailResponse);
  rpc DeleteTrack(DeleteTrackRequest) returns (DeleteResponse);
  rpc DeleteLesson(DeleteLessonRequest) returns (DeleteResponse);
  rpc DeleteSection(DeleteSectionRequest) returns (DeleteResponse);
}

message UpsertSectionRequest {
  string track_slug = 1;
  string lesson_slug = 2;
  string slug = 3;
  string title = 4;
  int32 position = 5;
  string kind = 6;              // "TEXT" | "EXERCISE"
  string content_markdown = 7;  // conteúdo integral, salvo no banco
}
// demais messages seguem o mesmo padrão do catalog.proto
```

### GraphQL (gateway)

```graphql
extend type Mutation {
  upsertTrack(input: UpsertTrackInput!): TrackDetail!
  upsertLesson(input: UpsertLessonInput!): LessonDetail!
  upsertSection(input: UpsertSectionInput!): SectionDetail!
  deleteTrack(slug: ID!): Boolean!
  deleteLesson(trackSlug: ID!, lessonSlug: ID!): Boolean!
  deleteSection(trackSlug: ID!, lessonSlug: ID!, sectionSlug: ID!): Boolean!
}
```

Todas as mutations exigem role admin (guard dedicado, ex.: `AdminGqlAuthGuard`).

## Tarefas

### Auth / Core
- [ ] Adicionar `role` ao `User` (enum `UserRole { STUDENT, ADMIN }`) + migration.
- [ ] Propagar role no `UserResponse` do `mio.users.v1` e no JWT (`role` claim) / query `me`.

### Core
- [ ] `CatalogAdminService` (módulo `catalog`, controller separado): upserts/deletes com validação de slug/posição.
- [ ] Regras de deleção: apagar lição/seção com progresso associado — bloquear, arquivar ou cascatear? (decisão em aberto).

### Gateway
- [ ] Guard `AdminGqlAuthGuard` (JWT + role).
- [ ] Mutations de admin no módulo `catalog`.

### Web
- [ ] Área `/admin` (layout + navegação, protegida por role).
- [ ] Telas de gestão de trilhas/lições/seções (listagem, formulários, reordenação).
- [ ] Editor de conteúdo da seção com preview usando o mesmo renderer do aluno.

## Critérios de aceite

- Admin logado cria uma trilha com lição e seção pela UI; a trilha aparece em `query { tracks }` para o aluno sem deploy/restart.
- Editar o conteúdo de uma seção reflete imediatamente na página da aula do aluno.
- Usuário sem role admin recebe erro `FORBIDDEN` nas mutations de admin e não vê a área `/admin`.
- Reordenar lições/seções não viola os uniques de posição (`Lesson.trackId+position`, `Section.lessonId+position`).

## Riscos & decisões em aberto

- **Modelagem do perfil**: campo `User.role` simples vs tabela de permissões. Começar simples (enum) — multi-tenancy/granularidade fica para quando existir requisito.
- **Componente de editor**: textarea markdown com preview vs editor rico (tiptap/ProseMirror serializando para markdown). Se um dia o formato migrar para blocos JSON, o contrato (`content_markdown`) evolui **nesta** spec — o armazenamento no banco não muda.
- **Draft/published**: o aluno vê tudo que existe ou só conteúdo publicado? Provável flag `Track.published`/`Section.published`.
- **Versionamento de conteúdo**: histórico de edições (quem mudou o quê) — provavelmente tabela `SectionRevision` futura.
- **Assets (imagens/vídeos)**: não vão no Postgres — object storage (ex.: S3) + URL no markdown. Escopo e upload ficam para quando o editor existir.
- **Deleção com progresso**: apagar seção/lição referenciada por `LessonProgress` destrói histórico do aluno — avaliar soft-delete/arquivamento.

## Dependências

- [01-auth](../01-auth/) — base de usuários/JWT (role será extensão dela).
- [02-tracks-lessons](../02-tracks-lessons/) — catálogo e armazenamento de conteúdo no banco (feito).
