import { Module } from "@nestjs/common"
import { ClientsModule } from "@nestjs/microservices"
import { gamificationClientOptions } from "./gamification-client.registry"
import { GamificationClientService } from "./gamification-client.service"

@Module({
  imports: [ClientsModule.register([gamificationClientOptions])],
  providers: [GamificationClientService],
  exports: [GamificationClientService],
})
export class GamificationClientModule {}
