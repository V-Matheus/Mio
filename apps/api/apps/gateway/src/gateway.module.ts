import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { GraphQLModule } from "@nestjs/graphql"
import type { Request } from "express"
import { InternalSecretGuard } from "./common/guards/internal-secret.guard"
import { AuthModule } from "./modules/auth/auth.module"
import { HealthModule } from "./modules/health/health.module"

const isProduction = process.env.NODE_ENV === "production"

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: false,
      introspection: !isProduction,
      csrfPrevention: isProduction,
      plugins: isProduction
        ? []
        : [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    HealthModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    // Toda operação GraphQL exige o segredo interno (tráfego server-to-server).
    { provide: APP_GUARD, useClass: InternalSecretGuard },
  ],
})
export class GatewayModule {}
