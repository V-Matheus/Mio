import { describe, expect, it, vi } from "vitest"
import { getHomeQuery } from "./home"

vi.mock("@/modules/home/services", () => ({
  getHomeData: vi.fn().mockResolvedValue({
    user: { name: "Dev" },
  }),
}))

describe("home queries", () => {
  it("deve delegar a busca para o service getHomeData", async () => {
    const data = await getHomeQuery()
    expect(data).toEqual({ user: { name: "Dev" } })
  })
})
