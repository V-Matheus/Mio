import { resolve } from "node:path"
import { sharedConfig } from "@mio/testing-config"
import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      // O Prisma Client do Core é gerado como módulo `.prisma/core`; o Vite o
      // trataria como caminho relativo (começa com ponto), então apontamos
      // explicitamente para o client gerado.
      ".prisma/core": resolve(import.meta.dirname, "node_modules/.prisma/core"),
      // Pacote de contratos gRPC compartilhado — resolve para o fonte, evitando
      // exigir o build do pacote só para rodar os testes.
      "@mio/grpc-contracts": resolve(
        import.meta.dirname,
        "../../packages/grpc-contracts/src",
      ),
    },
  },
  test: {
    ...sharedConfig,
    root: "./",
    include: ["tests/unit/**/*.test.ts"],
  },
})
