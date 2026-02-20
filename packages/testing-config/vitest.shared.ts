import type { UserConfig } from "vitest/config"

export const sharedConfig: UserConfig["test"] = {
  globals: true,
  include: ["**/*.test.{ts,tsx}"],
  passWithNoTests: true,
}
