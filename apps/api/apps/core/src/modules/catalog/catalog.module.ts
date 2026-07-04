import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { CatalogController } from "./catalog.controller"
import { EnrollmentsService } from "./enrollments.service"
import { LessonsService } from "./lessons.service"
import { TracksService } from "./tracks.service"

/**
 * Catálogo de conteúdo (spec 02): trilhas → lições → seções. Serve o
 * `CatalogService` (mio.catalog.v1) unificando tracks/lessons/enrollments,
 * conforme a opção prevista na spec.
 */
@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [TracksService, LessonsService, EnrollmentsService],
})
export class CatalogModule {}
