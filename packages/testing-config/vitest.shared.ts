import type { UserConfig } from "vitest/config"

export const sharedConfig: UserConfig["test"] = {
  globals: true,
  include: ["**/*.test.{ts,tsx}"],
  passWithNoTests: true,
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
  },
}
