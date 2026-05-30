import { resolve } from "node:path"

/**
 * Aliases compartilhados por todos os runners de teste (agregado, unit e e2e),
 * para que qualquer config resolva os módulos da mesma forma:
 *
 * - `.prisma/core`: o Prisma Client do Core é gerado como módulo `.prisma/core`;
 *   o Vite o trataria como caminho relativo (começa com ponto), então apontamos
 *   explicitamente para o client gerado.
 * - `@mio/grpc-contracts`: resolve para o fonte, evitando exigir o build do
 *   pacote só para rodar os testes.
 */
export const testAlias = {
  ".prisma/core": resolve(import.meta.dirname, "node_modules/.prisma/core"),
  "@mio/grpc-contracts": resolve(
    import.meta.dirname,
    "../../packages/grpc-contracts/src",
  ),
}
