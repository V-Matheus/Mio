import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { GraphQLError } from "graphql"

function unauthenticated(): GraphQLError {
  return new GraphQLError("Não autenticado", {
    extensions: { code: "UNAUTHENTICATED" },
  })
}

/** Decodifica o JWT (Bearer) e popula `req.userCode` com o `sub` do token. */
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req
    const header: string | undefined = req?.headers?.authorization
    if (!header?.startsWith("Bearer ")) {
      throw unauthenticated()
    }

    try {
      const payload = this.jwt.verify<{ sub: string; roles: string[] }>(header.slice(7))
      req.userCode = payload.sub
      req.userRoles = payload.roles || []
      return true
    } catch {
      throw unauthenticated()
    }
  }
}

/** Injeta o `userCode` resolvido pelo `GqlAuthGuard`. */
export const CurrentUserCode = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    GqlExecutionContext.create(context).getContext().req.userCode,
)

/** Injeta as `userRoles` resolvidas pelo `GqlAuthGuard`. */
export const CurrentUserRoles = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string[] =>
    GqlExecutionContext.create(context).getContext().req.userRoles || [],
)
