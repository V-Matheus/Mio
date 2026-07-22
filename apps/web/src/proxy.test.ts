import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { proxy } from "./proxy"

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}))

function makeRequest(path: string) {
  return new NextRequest(new URL(`http://localhost:3000${path}`))
}

describe("proxy middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should allow unauthenticated access to auth routes (/login)", async () => {
    vi.mocked(getToken).mockResolvedValue(null)
    const req = makeRequest("/login")
    const res = await proxy(req)
    expect(res).toBeUndefined()
  })

  it("should redirect unauthenticated access to private route (/studio) to /login", async () => {
    vi.mocked(getToken).mockResolvedValue(null)
    const req = makeRequest("/studio")
    const res = await proxy(req)
    expect(res).toBeInstanceOf(NextResponse)
    expect(res?.headers.get("location")).toBe("http://localhost:3000/login")
  })

  it("should redirect logged-in user accessing auth route to /home", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["STUDENT"] })
    const req = makeRequest("/login")
    const res = await proxy(req)
    expect(res?.headers.get("location")).toBe("http://localhost:3000/home")
  })

  it("should allow STUDENT to access /home", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["STUDENT"] })
    const req = makeRequest("/home")
    const res = await proxy(req)
    expect(res).toBeUndefined()
  })

  it("should redirect STUDENT trying to access /studio to /home", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["STUDENT"] })
    const req = makeRequest("/studio")
    const res = await proxy(req)
    expect(res?.headers.get("location")).toBe("http://localhost:3000/home")
  })

  it("should redirect STUDENT trying to access /painel to /home", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["STUDENT"] })
    const req = makeRequest("/painel")
    const res = await proxy(req)
    expect(res?.headers.get("location")).toBe("http://localhost:3000/home")
  })

  it("should allow TEACHER to access /studio", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["TEACHER"] })
    const req = makeRequest("/studio")
    const res = await proxy(req)
    expect(res).toBeUndefined()
  })

  it("should redirect TEACHER trying to access /painel to /studio", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["TEACHER"] })
    const req = makeRequest("/painel")
    const res = await proxy(req)
    expect(res?.headers.get("location")).toBe("http://localhost:3000/studio")
  })

  it("should allow ADMIN to access /painel", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["ADMIN"] })
    const req = makeRequest("/painel")
    const res = await proxy(req)
    expect(res).toBeUndefined()
  })

  it("should allow ADMIN to access /studio", async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: "user-1", roles: ["ADMIN"] })
    const req = makeRequest("/studio")
    const res = await proxy(req)
    expect(res).toBeUndefined()
  })
})
