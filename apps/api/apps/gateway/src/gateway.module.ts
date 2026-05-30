import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"
import type { Request } from "express"
import { AuthModule } from "./modules/auth/auth.module"
import { HealthModule } from "./modules/health/health.module"

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: false,
      introspection: process.env.NODE_ENV !== "production",
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    HealthModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule {}
