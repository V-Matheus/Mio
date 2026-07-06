import path from "node:path"
import { sharedConfig } from "@mio/testing-config"
import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"
import { testAlias } from "./vitest.alias"

export default defineConfig({
  plugins: [swc.vite()],
  resolve: { alias: testAlias },
  test: {
    ...sharedConfig,
    name: "api",
    root: path.resolve(import.meta.dirname),
    include: ["apps/**/*.test.ts", "tests/**/*.test.ts"],
  },
})
