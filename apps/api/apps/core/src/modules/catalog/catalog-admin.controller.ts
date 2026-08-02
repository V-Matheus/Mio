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
    categoryId?: number
    requestorCode: string
  }) {
    return this.catalogAdmin.createTrack(
      data.title,
      data.description,
      data.categoryId,
      data.requestorCode,
    )
  }

  @GrpcMethod(SERVICE_NAME, "UpdateTrack")
  async updateTrack(data: {
    trackId: number
    title: string
    description: string
    categoryId?: number
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.updateTrack(
      data.trackId,
      data.title,
      data.description,
      data.categoryId,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "DeleteTrack")
  async deleteTrack(data: {
    trackId: number
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.deleteTrack(
      data.trackId,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "UpsertLesson")
  async upsertLesson(data: {
    trackId: number
    lessonId?: number
    title: string
    position: number
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.upsertLesson(
      data.trackId,
      data.lessonId,
      data.title,
      data.position,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "DeleteLesson")
  async deleteLesson(data: {
    lessonId: number
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.deleteLesson(
      data.lessonId,
      data.requestorCode,
      data.requestorRole,
    )
  }

  @GrpcMethod(SERVICE_NAME, "UpsertSection")
  async upsertSection(data: {
    lessonId: number
    sectionId?: number
    title: string
    position: number
    kind: "TEXT" | "EXERCISE"
    contentMarkdown: string
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.upsertSection(
      data.lessonId,
      data.sectionId,
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
    sectionId: number
    requestorCode: string
    requestorRole: string
  }) {
    return this.catalogAdmin.deleteSection(
      data.sectionId,
      data.requestorCode,
      data.requestorRole,
    )
  }
}
