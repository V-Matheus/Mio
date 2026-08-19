import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProfileResolver } from "./profile.resolver"
import type { ProfileService } from "./profile.service"

describe("ProfileResolver", () => {
  let profileServiceMock: {
    getProfile: ReturnType<typeof vi.fn>
  }
  let resolver: ProfileResolver

  beforeEach(() => {
    profileServiceMock = {
      getProfile: vi.fn().mockResolvedValue({
        user: { code: "usr1", name: "Alice" },
      }),
    }
    resolver = new ProfileResolver(
      profileServiceMock as unknown as ProfileService,
    )
  })

  it("chama profileService com currentUserCode se userCode não for fornecido", async () => {
    const res = await resolver.profile(undefined, "usr1")

    expect(profileServiceMock.getProfile).toHaveBeenCalledWith("usr1")
    expect(res.user.name).toBe("Alice")
  })

  it("chama profileService com userCode específico se fornecido", async () => {
    const res = await resolver.profile("target-usr", "usr1")

    expect(profileServiceMock.getProfile).toHaveBeenCalledWith("target-usr")
    expect(res.user.name).toBe("Alice")
  })
})
