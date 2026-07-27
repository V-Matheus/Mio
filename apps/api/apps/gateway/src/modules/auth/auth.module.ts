import { Module } from "@nestjs/common"
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt"
import { ClientsModule } from "@nestjs/microservices"
import { gatewayGrpcClients } from "../../grpc/registry"
import { AuthResolver } from "./auth.resolver"
import { AuthService } from "./auth.service"
import { GqlAuthGuard } from "./guards/gql-auth.guard"
import { OptionalGqlAuthGuard } from "./guards/optional-gql-auth.guard"
import { PermissionsGuard } from "./guards/permissions.guard"
import { RolesGuard } from "./guards/roles.guard"

@Module({
  imports: [
    ClientsModule.register(gatewayGrpcClients),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        issuer: process.env.JWT_ISSUER ?? "mio-gateway",
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          "1h") as JwtSignOptions["expiresIn"],
      },
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    GqlAuthGuard,
    OptionalGqlAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    JwtModule,
    GqlAuthGuard,
    OptionalGqlAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
