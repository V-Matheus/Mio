# @mio/graphql-schema

SDL do schema GraphQL do **API Gateway**. É a **fonte única** consumida pelo
`codegen` do Web — vive num pacote de workspace (e não dentro de `apps/api`) para
**sobreviver ao `turbo prune`**: o build Docker do `@mio/web` só inclui os
pacotes que ele declara como dependência, então o schema precisa ser um deles.

> Mesmo raciocínio do `@mio/grpc-contracts`: artefato compartilhado entre apps,
> resolvido via workspace, presente tanto em dev quanto no tree podado do Docker.

## Como é gerado

`schema.gql` é **gerado** pelo gateway (`GraphQLModule` code-first, `autoSchemaFile`)
ao subir em dev — não edite à mão. Para mudar o schema, altere os
resolvers/DTOs/models do gateway e rode:

```bash
yarn dev:gateway      # reescreve packages/graphql-schema/schema.gql ao subir
```

Em produção o gateway mantém o schema só em memória (não escreve arquivo).

⚠️ **Staleness**: o arquivo só é reescrito quando o gateway sobe. Se alterar
resolvers sem rodar o gateway, o schema (e os tipos gerados no Web) ficam
defasados. `dev:gateway` regenera em watch.

## Quem consome

- **`apps/web`** declara `@mio/graphql-schema` como devDependency e o
  `codegen.ts` lê este `schema.gql` para gerar `src/lib/gql/generated/`.
