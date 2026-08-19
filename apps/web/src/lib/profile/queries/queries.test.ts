import { describe, expect, it, vi } from "vitest"
import { getProfileQuery } from "./profile"

const mockGetProfile = vi.fn()

vi.mock("../service", () => ({
  getProfile: (code?: string) => mockGetProfile(code),
}))

describe("profile queries", () => {
  it("chama getProfile repassando userCode", async () => {
    mockGetProfile.mockResolvedValueOnce({
      user: { code: "usr-1", name: "Alice" },
    })

    const result = await getProfileQuery("usr-1")

    expect(mockGetProfile).toHaveBeenCalledWith("usr-1")
    expect(result).toEqual({ user: { code: "usr-1", name: "Alice" } })
  })
})
