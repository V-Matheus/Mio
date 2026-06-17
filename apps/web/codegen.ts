import type { CodegenConfig } from "@graphql-codegen/cli"

/**
 * Gera tipos TypeScript a partir do schema do API Gateway (fonte única) e das
 * operações `graphql(...)` espalhadas em `src/`. A saída fica em
 * `src/lib/gql/generated/` (gitignored — recriada por `yarn codegen`).
 *
 * O schema vem do pacote `@mio/graphql-schema` (emitido pelo gateway via
 * `autoSchemaFile`), não de um servidor rodando — `yarn codegen` funciona
 * offline e em CI. O pacote é um workspace dep do web, então sobrevive ao
 * `turbo prune` do build Docker.
 */
const config: CodegenConfig = {
  schema: "../../packages/graphql-schema/schema.gql",
  documents: ["src/**/*.{ts,tsx}", "!src/lib/gql/generated/**"],
  ignoreNoDocuments: true,
  generates: {
    "src/lib/gql/generated/": {
      preset: "client",
      config: {
        fragmentMasking: false,
      },
    },
  },
}

export default config
