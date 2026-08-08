import { status } from "@grpc/grpc-js"
import { describe, expect, it } from "vitest"
import { GamificationErrorCode, gamificationError } from "./gamification.errors"

describe("gamificationError", () => {
  it("mapeia USER_NOT_FOUND para status NOT_FOUND", () => {
    const err = gamificationError(GamificationErrorCode.UserNotFound)
    const errObj = err.getError() as { code: number; message: string }
    expect(errObj.code).toBe(status.NOT_FOUND)
    expect(errObj.message).toBe("USER_NOT_FOUND")
  })

  it("mapeia INVALID_XP_RULE para status INVALID_ARGUMENT", () => {
    const err = gamificationError(GamificationErrorCode.InvalidXpRule)
    const errObj = err.getError() as { code: number; message: string }
    expect(errObj.code).toBe(status.INVALID_ARGUMENT)
    expect(errObj.message).toBe("INVALID_XP_RULE")
  })

  it("mapeia LEADERBOARD_UNAVAILABLE para status UNAVAILABLE", () => {
    const err = gamificationError(GamificationErrorCode.LeaderboardUnavailable)
    const errObj = err.getError() as { code: number; message: string }
    expect(errObj.code).toBe(status.UNAVAILABLE)
    expect(errObj.message).toBe("LEADERBOARD_UNAVAILABLE")
  })
})
