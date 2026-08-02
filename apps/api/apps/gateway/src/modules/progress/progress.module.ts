import { Module } from "@nestjs/common"
import { ClientsModule } from "@nestjs/microservices"
import { gatewayGrpcClients } from "../../grpc/registry"
import { AuthModule } from "../auth/auth.module"
import { ProgressResolver } from "./progress.resolver"
import { ProgressGatewayService } from "./progress.service"

@Module({
  imports: [ClientsModule.register(gatewayGrpcClients), AuthModule],
  providers: [ProgressGatewayService, ProgressResolver],
  exports: [ProgressGatewayService],
})
export class ProgressModule {}
