import { resolve } from "node:path"
import { sharedConfig } from "@mio/testing-config"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@modules": resolve(__dirname, "./src/modules"),
      "@shared": resolve(__dirname, "./src/shared"),
      "next/server": resolve(__dirname, "../../node_modules/next/server.js"),
    },
  },
  test: {
    ...sharedConfig,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
