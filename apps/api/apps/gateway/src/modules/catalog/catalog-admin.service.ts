import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import type { Observable } from "rxjs"
import { GrpcCaller } from "../../grpc/grpc-caller"
import { CATALOG_ADMIN_PACKAGE_TOKEN } from "../../grpc/registry"
import type {
  CreateTrackInput,
  UpdateTrackInput,
  UpsertLessonInput,
  UpsertSectionInput,
} from "./dto/admin-track.dto"
import type {
  AdminLessonSummary,
  AdminSectionSummary,
  AdminTrack,
  AdminTrackDetail,
} from "./models/admin-track.model"
import { SectionKind } from "./models/section-kind.enum"

interface ProtoCategory {
  id: string
  slug: string
  name: string
  color: string
}

interface ProtoTrack {
  id: number
  slug: string
  title: string
  description?: string
  creatorCode?: string
  lessonCount?: number
  category?: ProtoCategory
}

interface ProtoSection {
  id: number
  slug: string
  title: string
  position?: number
  kind?: string
  contentMarkdown?: string
}

interface ProtoLesson {
  id: number
  slug: string
  title: string
  position?: number
  sections?: ProtoSection[]
}

interface ProtoTrackDetail {
  id: number
  slug: string
  title: string
  description?: string
  creatorCode?: string
  category?: ProtoCategory
  lessons?: ProtoLesson[]
}

interface CatalogAdminGrpcClient {
  listAdminTracks(data: {
    requestorCode: string
    requestorRole: string
  }): Observable<{ tracks: ProtoTrack[] }>

  getAdminTrack(data: {
    slug: string
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoTrackDetail>

  createTrack(data: {
    title: string
    description: string
    categoryId?: number
    requestorCode: string
  }): Observable<ProtoTrack>

  updateTrack(data: {
    trackId: number
    title: string
    description: string
    categoryId?: number
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoTrack>

  deleteTrack(data: {
    trackId: number
    requestorCode: string
    requestorRole: string
  }): Observable<{ success: boolean }>

  upsertLesson(data: {
    trackId: number
    lessonId?: number
    title: string
    position?: number
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoLesson>

  deleteLesson(data: {
    lessonId: number
    requestorCode: string
    requestorRole: string
  }): Observable<{ success: boolean }>

  upsertSection(data: {
    lessonId: number
    sectionId?: number
    title: string
    position?: number
    kind?: string
    contentMarkdown?: string
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoSection>

  deleteSection(data: {
    sectionId: number
    requestorCode: string
    requestorRole: string
  }): Observable<{ success: boolean }>
}

@Injectable()
export class CatalogAdminService implements OnModuleInit {
  private client!: CatalogAdminGrpcClient
  private readonly caller = new GrpcCaller({
    serviceEnvVar: "CATALOG_ADMIN_GRPC_TIMEOUT_MS",
    timeoutCode: "UNAVAILABLE",
    timeoutMessage:
      "Serviço de administração de catálogo indisponível (tempo limite excedido)",
  })

  constructor(
    @Inject(CATALOG_ADMIN_PACKAGE_TOKEN)
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.client = this.grpcClient.getService<CatalogAdminGrpcClient>(
      "CatalogAdminService",
    )
  }

  async adminTracks(userCode: string, role: string): Promise<AdminTrack[]> {
    const res = await this.caller.call(
      this.client.listAdminTracks({
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return (res.tracks || []).map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description || undefined,
      category: t.category
        ? {
            id: t.category.id,
            slug: t.category.slug,
            name: t.category.name,
            color: t.category.color,
          }
        : undefined,
      creatorCode: t.creatorCode || "",
      lessonCount: t.lessonCount || 0,
    }))
  }

  async adminTrack(
    slug: string,
    userCode: string,
    role: string,
  ): Promise<AdminTrackDetail | null> {
    try {
      const res = await this.caller.call(
        this.client.getAdminTrack({
          slug,
          requestorCode: userCode,
          requestorRole: role,
        }),
      )
      return {
        id: res.id,
        slug: res.slug,
        title: res.title,
        description: res.description || undefined,
        category: res.category
          ? {
              id: res.category.id,
              slug: res.category.slug,
              name: res.category.name,
              color: res.category.color,
            }
          : undefined,
        creatorCode: res.creatorCode || "",
        lessons: (res.lessons || []).map((l: ProtoLesson) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          position: l.position || 0,
          sections: (l.sections || []).map((s: ProtoSection) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            position: s.position || 0,
            kind:
              s.kind === "EXERCISE" ? SectionKind.EXERCISE : SectionKind.TEXT,
            contentMarkdown: s.contentMarkdown || "",
          })),
        })),
      }
    } catch (error: unknown) {
      const details =
        (error as { details?: string })?.details ||
        (error as { extensions?: { details?: string } })?.extensions?.details ||
        (error as Error)?.message
      if (
        typeof details === "string" &&
        (details.includes("FORBIDDEN") || details.includes("TRACK_NOT_FOUND"))
      ) {
        return null
      }
      throw error
    }
  }

  async createTrack(
    input: CreateTrackInput,
    userCode: string,
  ): Promise<AdminTrack> {
    const res = await this.caller.call(
      this.client.createTrack({
        title: input.title,
        description: input.description ?? "",
        categoryId: input.categoryId ? Number(input.categoryId) : undefined,
        requestorCode: userCode,
      }),
    )
    return {
      id: res.id,
      slug: res.slug,
      title: res.title,
      description: res.description || undefined,
      category: res.category
        ? {
            id: res.category.id,
            slug: res.category.slug,
            name: res.category.name,
            color: res.category.color,
          }
        : undefined,
      creatorCode: res.creatorCode || "",
      lessonCount: res.lessonCount || 0,
    }
  }

  async updateTrack(
    id: number,
    input: UpdateTrackInput,
    userCode: string,
    role: string,
  ): Promise<AdminTrack> {
    const res = await this.caller.call(
      this.client.updateTrack({
        trackId: id,
        title: input.title,
        description: input.description ?? "",
        categoryId: input.categoryId ? Number(input.categoryId) : undefined,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return {
      id: res.id,
      slug: res.slug,
      title: res.title,
      description: res.description || undefined,
      category: res.category
        ? {
            id: res.category.id,
            slug: res.category.slug,
            name: res.category.name,
            color: res.category.color,
          }
        : undefined,
      creatorCode: res.creatorCode || "",
      lessonCount: res.lessonCount || 0,
    }
  }

  async deleteTrack(
    id: number,
    userCode: string,
    role: string,
  ): Promise<boolean> {
    const res = await this.caller.call(
      this.client.deleteTrack({
        trackId: id,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return res.success
  }

  async upsertLesson(
    input: UpsertLessonInput,
    userCode: string,
    role: string,
  ): Promise<AdminLessonSummary> {
    const res = await this.caller.call(
      this.client.upsertLesson({
        trackId: input.trackId,
        lessonId: input.id ?? undefined,
        title: input.title,
        position: input.position ?? undefined,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return {
      id: res.id,
      slug: res.slug,
      title: res.title,
      position: res.position || 0,
      sections: (res.sections || []).map((s: ProtoSection) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        position: s.position || 0,
        kind: s.kind === "EXERCISE" ? SectionKind.EXERCISE : SectionKind.TEXT,
        contentMarkdown: s.contentMarkdown || "",
      })),
    }
  }

  async deleteLesson(
    id: number,
    userCode: string,
    role: string,
  ): Promise<boolean> {
    const res = await this.caller.call(
      this.client.deleteLesson({
        lessonId: id,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return res.success
  }

  async upsertSection(
    input: UpsertSectionInput,
    userCode: string,
    role: string,
  ): Promise<AdminSectionSummary> {
    const res = await this.caller.call(
      this.client.upsertSection({
        lessonId: input.lessonId,
        sectionId: input.id ?? undefined,
        title: input.title,
        position: input.position ?? undefined,
        kind: input.kind ?? undefined,
        contentMarkdown: input.contentMarkdown ?? undefined,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return {
      id: res.id,
      slug: res.slug,
      title: res.title,
      position: res.position || 0,
      kind: res.kind === "EXERCISE" ? SectionKind.EXERCISE : SectionKind.TEXT,
      contentMarkdown: res.contentMarkdown || "",
    }
  }

  async deleteSection(
    id: number,
    userCode: string,
    role: string,
  ): Promise<boolean> {
    const res = await this.caller.call(
      this.client.deleteSection({
        sectionId: id,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return res.success
  }
}

export { CatalogAdminService as CatalogAdminGatewayService }
