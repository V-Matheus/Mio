import { catalogContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { EnrollmentsService } from "./enrollments.service"
import { LessonsService } from "./lessons.service"
import { TracksService } from "./tracks.service"

const SERVICE_NAME = catalogContract.service

@Controller()
export class CatalogController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly lessonsService: LessonsService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @GrpcMethod(SERVICE_NAME, "ListCategories")
  async listCategories() {
    const categories = await this.tracksService.listCategories()
    return { categories }
  }

  @GrpcMethod(SERVICE_NAME, "ListTracks")
  async listTracks(data: { userCode: string }) {
    const tracks = await this.tracksService.listTracks(data.userCode)
    return { tracks }
  }

  @GrpcMethod(SERVICE_NAME, "GetTrack")
  async getTrack(data: { slug: string; userCode: string }) {
    return this.tracksService.getTrack(data.slug, data.userCode)
  }

  @GrpcMethod(SERVICE_NAME, "GetLesson")
  async getLesson(data: { trackSlug: string; lessonSlug: string }) {
    return this.lessonsService.getLesson(data.trackSlug, data.lessonSlug)
  }

  @GrpcMethod(SERVICE_NAME, "GetSection")
  async getSection(data: {
    trackSlug: string
    lessonSlug: string
    sectionSlug: string
  }) {
    return this.lessonsService.getSection(
      data.trackSlug,
      data.lessonSlug,
      data.sectionSlug,
    )
  }

  @GrpcMethod(SERVICE_NAME, "EnrollUser")
  async enrollUser(data: { userCode: string; trackId: number }) {
    await this.enrollmentsService.enroll(data.userCode, data.trackId)
    return { ok: true }
  }
}
