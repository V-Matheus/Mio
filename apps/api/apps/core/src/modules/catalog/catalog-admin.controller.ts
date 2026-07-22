import { catalogAdminContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { CatalogAdminService } from "./catalog-admin.service"

const SERVICE_NAME = catalogAdminContract.service

@Controller()
export class CatalogAdminController {
  constructor(private readonly catalogAdmin: CatalogAdminService) {}

  @GrpcMethod(SERVICE_NAME, "ListAdminTracks")
  async listAdminTracks(data: {
    requestorCode: string
    requestorRole: string
  }) {
    const tracks = await this.catalogAdmin.listAdminTracks(
      data.requestorCode,
      data.requestorRole,
    )
    return { tracks }
  }

  @GrpcMethod(SERVICE_NAME, "GetAdminTrack")
  async getAdminTrack(data: {
    slug: string
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.getAdminTrack(
      data.slug,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "CreateTrack")
  async createTrack(data: {
    title: string
    description: string
    requestorCode: string
  }) {
    return this.catalogAdmin.createTrack(
      data.title,
      data.description,
      data.requestorCode,
    )
  }

  @GrpcMethod(SERVICE_NAME, "UpdateTrack")
  async updateTrack(data: {
    currentSlug: string
    title: string
    description: string
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.updateTrack(
      data.currentSlug,
      data.title,
      data.description,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "DeleteTrack")
  async deleteTrack(data: {
    slug: string
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.deleteTrack(
      data.slug,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "UpsertLesson")
  async upsertLesson(data: {
    trackSlug: string
    slug: string
    title: string
    position: number
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.upsertLesson(
      data.trackSlug,
      data.slug,
      data.title,
      data.position,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "DeleteLesson")
  async deleteLesson(data: {
    trackSlug: string
    lessonSlug: string
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.deleteLesson(
      data.trackSlug,
      data.lessonSlug,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "UpsertSection")
  async upsertSection(data: {
    trackSlug: string
    lessonSlug: string
    slug: string
    title: string
    position: number
    kind: "TEXT" | "EXERCISE"
    contentMarkdown: string
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.upsertSection(
      data.trackSlug,
      data.lessonSlug,
      data.slug,
      data.title,
      data.position,
      data.kind,
      data.contentMarkdown,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "DeleteSection")
  async deleteSection(data: {
    trackSlug: string
    lessonSlug: string
    sectionSlug: string
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.deleteSection(
      data.trackSlug,
      data.lessonSlug,
      data.sectionSlug,
      data.requestorCode,
      data.requestorRole,
    )
  }
}
