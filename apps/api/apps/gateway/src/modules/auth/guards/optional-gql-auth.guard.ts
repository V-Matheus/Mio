import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"

/**
 * Variante opcional do `GqlAuthGuard`: popula `req.userCode` quando houver um
 * Bearer válido, mas nunca bloqueia a request. Para operações públicas que
 * personalizam a resposta quando há usuário logado (ex.: `enrolled`/`completed`
 * no catálogo).
 */
@Injectable()
export class OptionalGqlAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = GqlExecutionContext.create(context).getContext().req
    const header: string | undefined = req?.headers?.authorization
    if (header?.startsWith("Bearer ")) {
      try {
        const payload = this.jwt.verify<{ sub: string; roles: string[] }>(header.slice(7))
        req.userCode = payload.sub
        req.userRoles = payload.roles || []
      } catch {
        // token inválido em operação pública = segue como visitante anônimo
      }
    }
    return true
  }
}
