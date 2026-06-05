import { Injectable, type PipeTransform } from "@nestjs/common"
import { GraphQLError } from "graphql"
import type { ZodType } from "zod"

/**
 * Valida o argumento contra um schema zod antes de chegar ao resolver. Em caso
 * de falha, emite um `GraphQLError` com `code: "BAD_USER_INPUT"` e a lista de
 * problemas por campo — mesmo formato de erro usado no resto do gateway.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new GraphQLError("Dados de entrada inválidos", {
        extensions: {
          code: "BAD_USER_INPUT",
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      })
    }
    return result.data
  }
}
