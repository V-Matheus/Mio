import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { GqlExecutionContext } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { GraphQLError } from "graphql"
import { ROLES_KEY } from "../decorators/roles.decorator"

function unauthenticated(): GraphQLError {
  return new GraphQLError("Não autenticado", {
    extensions: { code: "UNAUTHENTICATED" },
  })
}

function forbidden(): GraphQLError {
  return new GraphQLError("Acesso negado", {
    extensions: { code: "FORBIDDEN" },
  })
}

/**
 * Guard de Autenticação e Permissionamento unificado.
 *
 * 1. Decodifica e valida o JWT Bearer.
 * 2. Injeta `userCode`, `userRoles` e `primaryRole` ("ADMIN" | "TEACHER" | "STUDENT") na requisição.
 * 3. Valida se o usuário possui a role exigida via `@Roles(...)`.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req
    const header: string | undefined = req?.headers?.authorization

    if (!header?.startsWith("Bearer ")) {
      throw unauthenticated()
    }

    let payload: { sub: string; roles: string[] }
    try {
      payload = this.jwt.verify<{ sub: string; roles: string[] }>(
        header.slice(7),
      )
      req.userCode = payload.sub
      req.userRoles = payload.roles || []
      req.primaryRole = payload.roles?.includes("ADMIN")
        ? "ADMIN"
        : payload.roles?.includes("TEACHER")
          ? "TEACHER"
          : "STUDENT"
    } catch {
      throw unauthenticated()
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const hasRole = req.userRoles.some((role: string) =>
      requiredRoles.includes(role),
    )

    if (!hasRole) {
      throw forbidden()
    }

    return true
  }
}

/** Injeta a role principal ("ADMIN" | "TEACHER" | "STUDENT") na requisição */
export const CurrentUserPrimaryRole = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    GqlExecutionContext.create(context).getContext().req.primaryRole ||
    "STUDENT",
)
