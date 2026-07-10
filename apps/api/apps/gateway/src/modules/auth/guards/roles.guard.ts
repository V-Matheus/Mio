import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { GqlExecutionContext } from "@nestjs/graphql"
import { GraphQLError } from "graphql"
import { ROLES_KEY } from "../decorators/roles.decorator"

function forbidden(): GraphQLError {
  return new GraphQLError("Acesso negado", {
    extensions: { code: "FORBIDDEN" },
  })
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const req = GqlExecutionContext.create(context).getContext().req
    const userRoles: string[] = req?.userRoles || []

    const hasRole = userRoles.some((role) => requiredRoles.includes(role))
    if (!hasRole) {
      throw forbidden()
    }

    return true
  }
}
