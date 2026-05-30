import { Module } from "@nestjs/common"
import { HealthModule } from "./modules/health/health.module"
import { PrismaModule } from "./modules/prisma/prisma.module"
import { UsersModule } from "./modules/users/users.module"

@Module({
  imports: [PrismaModule, HealthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class CoreModule {}
