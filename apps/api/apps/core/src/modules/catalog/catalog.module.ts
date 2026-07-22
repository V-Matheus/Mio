import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { CatalogController } from "./catalog.controller"
import { CatalogAdminController } from "./catalog-admin.controller"
import { CatalogAdminService } from "./catalog-admin.service"
import { EnrollmentsService } from "./enrollments.service"
import { LessonsService } from "./lessons.service"
import { TracksService } from "./tracks.service"

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController, CatalogAdminController],
  providers: [
    TracksService,
    LessonsService,
    EnrollmentsService,
    CatalogAdminService,
  ],
})
export class CatalogModule {}
