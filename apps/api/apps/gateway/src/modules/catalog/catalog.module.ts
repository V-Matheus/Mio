import { Module } from "@nestjs/common"
import { ClientsModule } from "@nestjs/microservices"
import { gatewayGrpcClients } from "../../grpc/registry"
import { AuthModule } from "../auth/auth.module"
import { CatalogResolver } from "./catalog.resolver"
import { CatalogService } from "./catalog.service"
import { CatalogAdminResolver } from "./catalog-admin.resolver"
import { CatalogAdminGatewayService } from "./catalog-admin.service"

@Module({
  imports: [ClientsModule.register(gatewayGrpcClients), AuthModule],
  providers: [
    CatalogService,
    CatalogResolver,
    CatalogAdminGatewayService,
    CatalogAdminResolver,
  ],
})
export class CatalogModule {}
