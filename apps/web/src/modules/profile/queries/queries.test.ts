import { describe, expect, it, vi } from "vitest"
import { getProfileQuery } from "./profile"

const mockGetProfile = vi.fn()

vi.mock("@/modules/profile/services", () => ({
  getProfile: () => mockGetProfile(),
}))

describe("profile queries", () => {
  it("chama getProfile para obter perfil do usuário autenticado", async () => {
    mockGetProfile.mockResolvedValueOnce({
      user: { code: "usr-1", name: "Alice" },
    })

    const result = await getProfileQuery()

    expect(mockGetProfile).toHaveBeenCalled()
    expect(result).toEqual({ user: { code: "usr-1", name: "Alice" } })
  })
})
