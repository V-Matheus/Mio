import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { firstValueFrom, type Observable } from "rxjs"
import { CATALOG_ADMIN_PACKAGE_TOKEN } from "../../grpc/registry"
import type {
  CreateTrackInput,
  UpdateTrackInput,
  UpsertLessonInput,
  UpsertSectionInput,
} from "./dto/admin-track.dto"
import type { AdminTrack, AdminTrackDetail } from "./models/admin-track.model"
import { SectionKind } from "./models/section-kind.enum"

export interface ProtoSection {
  slug: string
  title: string
  position: number
  kind: string
  contentMarkdown: string
}

export interface ProtoLesson {
  slug: string
  title: string
  position: number
  sections?: ProtoSection[]
}

export interface ProtoTrack {
  slug: string
  title: string
  description?: string
  creatorCode?: string
  lessonCount?: number
}

export interface ProtoTrackDetail extends ProtoTrack {
  lessons?: ProtoLesson[]
}

export interface CatalogAdminServiceClient {
  listAdminTracks(data: {
    requestorCode: string
    requestorRole: string
  }): Observable<{ tracks?: ProtoTrack[] }>
  getAdminTrack(data: {
    slug: string
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoTrackDetail>
  createTrack(data: {
    title: string
    description?: string
    requestorCode: string
  }): Observable<ProtoTrack>
  updateTrack(data: {
    currentSlug: string
    title: string
    description?: string
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoTrack>
  deleteTrack(data: {
    slug: string
    requestorCode: string
    requestorRole: string
  }): Observable<{ success?: boolean }>
  upsertLesson(data: {
    trackSlug: string
    slug?: string
    title: string
    position?: number
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoLesson>
  deleteLesson(data: {
    trackSlug: string
    lessonSlug: string
    requestorCode: string
    requestorRole: string
  }): Observable<{ success?: boolean }>
  upsertSection(data: {
    trackSlug: string
    lessonSlug: string
    slug?: string
    title: string
    position?: number
    kind?: string
    contentMarkdown?: string
    requestorCode: string
    requestorRole: string
  }): Observable<ProtoSection>
  deleteSection(data: {
    trackSlug: string
    lessonSlug: string
    sectionSlug: string
    requestorCode: string
    requestorRole: string
  }): Observable<{ success?: boolean }>
}

@Injectable()
export class CatalogAdminGatewayService implements OnModuleInit {
  private client!: CatalogAdminServiceClient

  constructor(
    @Inject(CATALOG_ADMIN_PACKAGE_TOKEN)
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.client = this.grpcClient.getService<CatalogAdminServiceClient>(
      "CatalogAdminService",
    )
  }

  async adminTracks(userCode: string, role: string): Promise<AdminTrack[]> {
    const res = await firstValueFrom(
      this.client.listAdminTracks({
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return (res.tracks || []).map((t) => ({
      slug: t.slug,
      title: t.title,
      description: t.description || undefined,
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
      const res = await firstValueFrom(
        this.client.getAdminTrack({
          slug,
          requestorCode: userCode,
          requestorRole: role,
        }),
      )
      return {
        slug: res.slug,
        title: res.title,
        description: res.description || undefined,
        creatorCode: res.creatorCode || "",
        lessons: (res.lessons || []).map((l: ProtoLesson) => ({
          slug: l.slug,
          title: l.title,
          position: l.position || 0,
          sections: (l.sections || []).map((s: ProtoSection) => ({
            slug: s.slug,
            title: s.title,
            position: s.position || 0,
            kind:
              s.kind === "EXERCISE" ? SectionKind.EXERCISE : SectionKind.TEXT,
            contentMarkdown: s.contentMarkdown || "",
          })),
        })),
      }
    } catch {
      return null
    }
  }

  async createTrack(
    input: CreateTrackInput,
    userCode: string,
  ): Promise<AdminTrack> {
    const res = await firstValueFrom(
      this.client.createTrack({
        title: input.title,
        description: input.description ?? "",
        requestorCode: userCode,
      }),
    )
    return {
      slug: res.slug,
      title: res.title,
      description: res.description || undefined,
      creatorCode: res.creatorCode || "",
      lessonCount: res.lessonCount || 0,
    }
  }

  async updateTrack(
    slug: string,
    input: UpdateTrackInput,
    userCode: string,
    role: string,
  ): Promise<AdminTrack> {
    const res = await firstValueFrom(
      this.client.updateTrack({
        currentSlug: slug,
        title: input.title,
        description: input.description ?? "",
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return {
      slug: res.slug,
      title: res.title,
      description: res.description || undefined,
      creatorCode: res.creatorCode || "",
      lessonCount: res.lessonCount || 0,
    }
  }

  async deleteTrack(
    slug: string,
    userCode: string,
    role: string,
  ): Promise<boolean> {
    const res = await firstValueFrom(
      this.client.deleteTrack({
        slug,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return !!res.success
  }

  async upsertLesson(input: UpsertLessonInput, userCode: string, role: string) {
    const res = await firstValueFrom(
      this.client.upsertLesson({
        trackSlug: input.trackSlug,
        slug: input.slug ?? "",
        title: input.title,
        position: input.position ?? 0,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return res
  }

  async deleteLesson(
    trackSlug: string,
    lessonSlug: string,
    userCode: string,
    role: string,
  ): Promise<boolean> {
    const res = await firstValueFrom(
      this.client.deleteLesson({
        trackSlug,
        lessonSlug,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return !!res.success
  }

  async upsertSection(
    input: UpsertSectionInput,
    userCode: string,
    role: string,
  ) {
    const res = await firstValueFrom(
      this.client.upsertSection({
        trackSlug: input.trackSlug,
        lessonSlug: input.lessonSlug,
        slug: input.slug ?? "",
        title: input.title,
        position: input.position ?? 0,
        kind: input.kind || "TEXT",
        contentMarkdown: input.contentMarkdown ?? "",
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return {
      slug: res.slug,
      title: res.title,
      position: res.position || 0,
      kind: res.kind === "EXERCISE" ? SectionKind.EXERCISE : SectionKind.TEXT,
      contentMarkdown: res.contentMarkdown || "",
    }
  }

  async deleteSection(
    trackSlug: string,
    lessonSlug: string,
    sectionSlug: string,
    userCode: string,
    role: string,
  ): Promise<boolean> {
    const res = await firstValueFrom(
      this.client.deleteSection({
        trackSlug,
        lessonSlug,
        sectionSlug,
        requestorCode: userCode,
        requestorRole: role,
      }),
    )
    return !!res.success
  }
}
