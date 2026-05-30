import { GraphQLError } from "graphql"
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { ZodValidationPipe } from "../../apps/gateway/src/common/pipes/zod-validation.pipe"

const schema = z.object({
  email: z.email(),
  age: z.number().min(0),
})

describe("ZodValidationPipe", () => {
  it("retorna o valor parseado quando válido", () => {
    const pipe = new ZodValidationPipe(schema)
    const value = { email: "a@b.com", age: 5 }
    expect(pipe.transform(value)).toEqual(value)
  })

  it("aplica transformações do schema (ex.: trim)", () => {
    const pipe = new ZodValidationPipe(z.string().trim())
    expect(pipe.transform("  hi  ")).toBe("hi")
  })

  it("lança GraphQLError BAD_USER_INPUT com um issue por campo inválido", () => {
    const pipe = new ZodValidationPipe(schema)
    try {
      pipe.transform({ email: "nope", age: -1 })
      expect.unreachable("deveria ter lançado")
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError)
      const ext = (error as GraphQLError).extensions
      expect(ext.code).toBe("BAD_USER_INPUT")
      const issues = ext.issues as Array<{ path: string; message: string }>
      expect(issues.map((i) => i.path).sort()).toEqual(["age", "email"])
      expect(issues.every((i) => typeof i.message === "string")).toBe(true)
    }
  })
})
