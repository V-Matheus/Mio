import { describe, expect, it } from "vitest"
import { ProgressErrorCode, progressError } from "./progress.errors"

describe("progressError", () => {
  it("cria RpcException com código de erro e status gRPC correspondente", () => {
    const err = progressError(ProgressErrorCode.SectionNotFound)
    expect(err.getError()).toEqual({ code: 5, message: "SECTION_NOT_FOUND" })
  })
})
