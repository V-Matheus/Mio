import type { ClientGrpc } from "@nestjs/microservices"
import { NEVER, of, throwError } from "rxjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoreClientService, getCoreGrpcTimeoutMs } from "./core-client.service"

describe("CoreClientService", () => {
  let service: CoreClientService
  let usersServiceClientMock: {
    batchGetUsers: ReturnType<typeof vi.fn>
  }
  let clientGrpcMock: ClientGrpc

  beforeEach(() => {
    vi.useRealTimers()
    delete process.env.CORE_GRPC_TIMEOUT_MS
    delete process.env.GRPC_TIMEOUT_MS

    usersServiceClientMock = {
      batchGetUsers: vi.fn(),
    }
    clientGrpcMock = {
      getService: vi.fn().mockReturnValue(usersServiceClientMock),
      getClientByServiceName: vi.fn(),
    } as unknown as ClientGrpc

    service = new CoreClientService(clientGrpcMock)
    service.onModuleInit()
  })

  it("retorna lista vazia se codes for vazio ou nulo", async () => {
    expect(await service.batchGetUsers([])).toEqual([])
    expect(await service.batchGetUsers(null as unknown as string[])).toEqual([])
    expect(usersServiceClientMock.batchGetUsers).not.toHaveBeenCalled()
  })

  it("retorna usuários quando a chamada gRPC é bem-sucedida", async () => {
    const mockUsers = [
      {
        code: "user-1",
        email: "user1@example.com",
        name: "User One",
        avatarUrl: "https://avatar.url/1",
        roles: ["student"],
      },
    ]
    usersServiceClientMock.batchGetUsers.mockReturnValue(
      of({ users: mockUsers }),
    )

    const result = await service.batchGetUsers(["user-1"])
    expect(result).toEqual(mockUsers)
    expect(usersServiceClientMock.batchGetUsers).toHaveBeenCalledWith({
      codes: ["user-1"],
    })
  })

  it("retorna lista vazia se a chamada gRPC emitir erro", async () => {
    usersServiceClientMock.batchGetUsers.mockReturnValue(
      throwError(() => new Error("gRPC error")),
    )

    const result = await service.batchGetUsers(["user-1"])
    expect(result).toEqual([])
  })

  it("retorna lista vazia se a chamada gRPC não responder dentro do tempo limite", async () => {
    usersServiceClientMock.batchGetUsers.mockReturnValue(NEVER)

    vi.useFakeTimers()
    const promise = service.batchGetUsers(["user-1"])
    vi.advanceTimersByTime(3500)
    const result = await promise
    expect(result).toEqual([])
    vi.useRealTimers()
  })

  it("getCoreGrpcTimeoutMs lê CORE_GRPC_TIMEOUT_MS ou GRPC_TIMEOUT_MS com fallback de 3000ms", () => {
    expect(getCoreGrpcTimeoutMs()).toBe(3000)

    process.env.CORE_GRPC_TIMEOUT_MS = "8000"
    expect(getCoreGrpcTimeoutMs()).toBe(8000)

    delete process.env.CORE_GRPC_TIMEOUT_MS
    process.env.GRPC_TIMEOUT_MS = "6000"
    expect(getCoreGrpcTimeoutMs()).toBe(6000)
  })
})
