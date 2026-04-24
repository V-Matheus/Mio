import { Module } from "@nestjs/common"
import { HealthModule } from "./modules/health/health.module"

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [],
})
export class GatewayModule {}
