import type { UserConfig } from "vitest/config"

export const sharedConfig: UserConfig["test"] = {
  globals: true,
  include: ["**/*.test.{ts,tsx}"],
  passWithNoTests: true,
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
}
