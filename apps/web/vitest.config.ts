import path from "node:path"
import { sharedConfig } from "@mio/testing-config"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
  test: {
    ...sharedConfig,
    name: "web",
    root: path.resolve(import.meta.dirname),
    environment: "jsdom",
    setupFiles: ["@mio/testing-config/setup"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
})
