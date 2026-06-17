# API Gateway

Gateway GraphQL (NestJS + Apollo, schema code-first). Stateless: recebe as
operações GraphQL do Web e roteia para os microsserviços via gRPC. Todo tráfego
exige o header `x-internal-secret` (`InternalSecretGuard`) — só o Next.js Server
fala com o gateway, nunca o browser (ver `specs/01-auth`).

## Schema GraphQL — fonte única (`@mio/graphql-schema`)

O schema é **code-first**: definido pelos decorators (`@ObjectType`, `@InputType`,
`@Resolver`, `@Field`) nos resolvers/models de cada módulo. O `GraphQLModule`
(`autoSchemaFile`) **gera o SDL** a partir desses decorators.

- **Em dev**, o SDL é escrito em `packages/graphql-schema/schema.gql` (commitado,
  `sortSchema: true` para diffs estáveis). Esse arquivo é a **fonte única**
  consumida pelo `codegen` do Web. Fica num **pacote de workspace** (e não em
  `apps/gateway/src/`) para sobreviver ao `turbo prune` do build Docker do web —
  ver `packages/graphql-schema/README.md`.
- **Em produção**, o schema fica só em memória (não escreve em disco).

### Como regenerar

```bash
yarn dev:gateway      # nest start gateway --watch — reescreve o schema.gql ao subir
```

`packages/graphql-schema/schema.gql` é **gerado** — não edite à mão. Para mudar o
schema, altere os resolvers/DTOs/models e suba o gateway.

> ⚠️ **Staleness**: o `schema.gql` só é reescrito quando o gateway sobe. Se você
> alterar resolvers sem rodar o gateway, o snapshot (e os tipos gerados no Web a
> partir dele) ficam defasados. `dev:gateway` regenera em watch; rode-o ao mexer
> no schema.

## Consumo no Web (codegen)

O `apps/web` gera tipos TypeScript a partir deste schema com o GraphQL Code
Generator (preset `client`). O fluxo:

1. Resolver/DTO no gateway muda → `yarn dev:gateway` reescreve o `schema.gql` em
   `packages/graphql-schema`.
2. No web, `yarn codegen` lê o schema do pacote `@mio/graphql-schema` (declarado
   como devDependency) + as operações `graphql(...)` e gera
   `apps/web/src/lib/gql/generated/` (gitignored).
3. As operações usam o `graphql()` tipado; `getGatewayClient().request(doc, vars)`
   fica tipado automaticamente, sem generics manuais.

Os pre-hooks do web (`predev`/`prebuild`/`precheck-types`/`pretest*`) rodam o
`codegen` antes de cada comando, então os tipos gerados sempre existem mesmo
estando fora do versionamento.
