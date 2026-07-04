import { catalogContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { EnrollmentsService } from "./enrollments.service"
import type { LessonDetail, SectionDetail } from "./lessons.service"
import { LessonsService } from "./lessons.service"
import type { TrackDetail, TrackSummary } from "./tracks.service"
import { TracksService } from "./tracks.service"

const CATALOG_SERVICE = catalogContract.service

@Controller()
export class CatalogController {
  constructor(
    private readonly tracks: TracksService,
    private readonly lessons: LessonsService,
    private readonly enrollments: EnrollmentsService,
  ) {}

  @GrpcMethod(CATALOG_SERVICE, "ListTracks")
  async listTracks(data: {
    userCode: string
  }): Promise<{ tracks: TrackSummary[] }> {
    return { tracks: await this.tracks.listTracks(data.userCode) }
  }

  @GrpcMethod(CATALOG_SERVICE, "GetTrack")
  getTrack(data: { slug: string; userCode: string }): Promise<TrackDetail> {
    return this.tracks.getTrack(data.slug, data.userCode)
  }

  @GrpcMethod(CATALOG_SERVICE, "GetLesson")
  getLesson(data: {
    trackSlug: string
    lessonSlug: string
    userCode: string
  }): Promise<LessonDetail> {
    return this.lessons.getLesson(data.trackSlug, data.lessonSlug)
  }

  @GrpcMethod(CATALOG_SERVICE, "GetSection")
  getSection(data: {
    trackSlug: string
    lessonSlug: string
    sectionSlug: string
  }): Promise<SectionDetail> {
    return this.lessons.getSection(
      data.trackSlug,
      data.lessonSlug,
      data.sectionSlug,
    )
  }

  @GrpcMethod(CATALOG_SERVICE, "EnrollUser")
  async enrollUser(data: {
    userCode: string
    trackSlug: string
  }): Promise<{ ok: boolean }> {
    await this.enrollments.enroll(data.userCode, data.trackSlug)
    return { ok: true }
  }
}
