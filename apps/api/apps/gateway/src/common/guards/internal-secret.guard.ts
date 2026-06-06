import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common"
import { type GqlContextType, GqlExecutionContext } from "@nestjs/graphql"
import { GraphQLError } from "graphql"

function forbidden(): GraphQLError {
  return new GraphQLError("Acesso negado", {
    extensions: { code: "FORBIDDEN" },
  })
}

/**
 * Garante que toda operação GraphQL venha de um caller confiável (o servidor
 * Next.js), exigindo o header `x-internal-secret` igual ao `INTERNAL_API_SECRET`.
 *
 * O Gateway só aceita tráfego server-to-server; o browser nunca fala direto com
 * ele. Ferramentas de teste (Postman, Apollo Sandbox) precisam enviar o header.
 *
 * Aplica-se apenas a requests GraphQL — contextos REST (ex.: health probes)
 * passam direto.
 */
@Injectable()
export class InternalSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.getType<GqlContextType>() !== "graphql") {
      return true
    }

    const secret = process.env.INTERNAL_API_SECRET
    if (!secret) {
      throw new GraphQLError("INTERNAL_API_SECRET não configurado", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      })
    }

    const req = GqlExecutionContext.create(context).getContext().req
    const provided: string | undefined = req?.headers?.["x-internal-secret"]
    if (provided !== secret) {
      throw forbidden()
    }

    return true
  }
}
