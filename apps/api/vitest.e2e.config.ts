import { sharedConfig } from "@mio/testing-config"
import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"
import { testAlias } from "./vitest.alias"

export default defineConfig({
  plugins: [
    swc.vite({ jsc: { transform: { react: { runtime: "automatic" } } } }),
  ],
  resolve: { alias: testAlias },
  test: {
    ...sharedConfig,
    root: "./",
    include: ["tests/e2e/**/*.test.ts"],
  },
})
