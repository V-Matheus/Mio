import { Module } from "@nestjs/common"
import { ClientsModule } from "@nestjs/microservices"
import { gatewayGrpcClients } from "../../grpc/registry"
import { AuthModule } from "../auth/auth.module"
import { AchievementsResolver } from "./achievements.resolver"
import { AchievementsGatewayService } from "./achievements.service"

@Module({
  imports: [ClientsModule.register(gatewayGrpcClients), AuthModule],
  providers: [AchievementsGatewayService, AchievementsResolver],
  exports: [AchievementsGatewayService],
})
export class AchievementsModule {}
