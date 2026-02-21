import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["apps/api", "apps/web"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "**/*.config.{ts,js,mjs}",
        "**/*.d.ts",
        "**/main.ts",
        "**/node_modules/**",
        "**/tests/**",
        "**/dist/**",
        "**/.next/**",
        "**/coverage/**",
        "**/packages/**",
      ],
    },
  },
})
