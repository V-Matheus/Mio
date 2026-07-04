import { Module } from "@nestjs/common"
import { ClientsModule } from "@nestjs/microservices"
import { gatewayGrpcClients } from "../../grpc/registry"
import { AuthModule } from "../auth/auth.module"
import { CatalogResolver } from "./catalog.resolver"
import { CatalogService } from "./catalog.service"

/**
 * Catálogo de trilhas/aulas (spec 02): resolvers GraphQL que roteiam via gRPC
 * para o `CatalogService` do Core. Queries são públicas (auth opcional só
 * personaliza `enrolled`/`completed`); a matrícula exige usuário logado.
 */
@Module({
  imports: [ClientsModule.register(gatewayGrpcClients), AuthModule],
  providers: [CatalogService, CatalogResolver],
})
export class CatalogModule {}
