import { sharedConfig } from "@mio/testing-config"
import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"
import { testAlias } from "./vitest.alias"

export default defineConfig({
  plugins: [swc.vite()],
  resolve: { alias: testAlias },
  test: {
    ...sharedConfig,
    root: "./",
    include: ["apps/**/*.test.ts"],
  },
})
