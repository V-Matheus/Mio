import { sharedConfig } from "@mio/testing-config"
import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    ...sharedConfig,
    root: "./",
    include: ["tests/e2e/**/*.test.ts"],
  },
})
