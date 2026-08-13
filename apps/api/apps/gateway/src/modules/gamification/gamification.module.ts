import { Module } from "@nestjs/common"
import { ClientsModule } from "@nestjs/microservices"
import { gatewayGrpcClients } from "../../grpc/registry"
import { AuthModule } from "../auth/auth.module"
import { GamificationResolver } from "./gamification.resolver"
import { GamificationGatewayService } from "./gamification.service"

@Module({
  imports: [ClientsModule.register(gatewayGrpcClients), AuthModule],
  providers: [GamificationGatewayService, GamificationResolver],
  exports: [GamificationGatewayService],
})
export class GamificationModule {}
