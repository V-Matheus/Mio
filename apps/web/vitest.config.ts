import path from "node:path"
import { sharedConfig } from "@mio/testing-config"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@modules": path.resolve(import.meta.dirname, "./src/modules"),
      "@shared": path.resolve(import.meta.dirname, "./src/shared"),
      "next/server": path.resolve(
        import.meta.dirname,
        "../../node_modules/next/server.js",
      ),
    },
  },
  test: {
    ...sharedConfig,
    name: "web",
    root: path.resolve(import.meta.dirname),
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
