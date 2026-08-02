import { EventsModule } from "@mio/events"
import { Module } from "@nestjs/common"
import { CatalogModule } from "./modules/catalog/catalog.module"
import { HealthModule } from "./modules/health/health.module"
import { PrismaModule } from "./modules/prisma/prisma.module"
import { ProgressModule } from "./modules/progress/progress.module"
import { UsersModule } from "./modules/users/users.module"

@Module({
  imports: [
    EventsModule,
    PrismaModule,
    HealthModule,
    UsersModule,
    CatalogModule,
    ProgressModule,
  ],
  controllers: [],
  providers: [],
})
export class CoreModule {}
