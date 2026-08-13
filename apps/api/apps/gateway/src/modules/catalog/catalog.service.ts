import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { GrpcCaller } from "../../grpc/grpc-caller"
import { CATALOG_PACKAGE_TOKEN } from "../../grpc/registry"
import { Category } from "./models/category.model"
import { LessonDetail } from "./models/lesson-detail.model"
import { LessonSummary } from "./models/lesson-summary.model"
import { SectionDetail } from "./models/section-detail.model"
import { SectionKind } from "./models/section-kind.enum"
import { SectionSummary } from "./models/section-summary.model"
import { Track } from "./models/track.model"
import { TrackDetail } from "./models/track-detail.model"
import type {
  CatalogServiceClient,
  GrpcCategory,
  GrpcLessonDetail,
  GrpcLessonSummary,
  GrpcSectionDetail,
  GrpcSectionSummary,
  GrpcTrack,
  GrpcTrackDetail,
} from "./repositories/catalog.repository"

const ERROR_MESSAGES: Record<string, string> = {
  TRACK_NOT_FOUND: "Trilha não encontrada",
  LESSON_NOT_FOUND: "Lição não encontrada",
  SECTION_NOT_FOUND: "Seção não encontrada",
  USER_NOT_FOUND: "Usuário não encontrado",
}

/** Códigos que viram `null` nas queries de detalhe (retorno nullable na spec). */
const NOT_FOUND_CODES = new Set([
  "TRACK_NOT_FOUND",
  "LESSON_NOT_FOUND",
  "SECTION_NOT_FOUND",
])

@Injectable()
export class CatalogService implements OnModuleInit {
  private catalogService!: CatalogServiceClient
  private readonly caller = new GrpcCaller({
    serviceEnvVar: "CATALOG_GRPC_TIMEOUT_MS",
    errorMap: ERROR_MESSAGES,
    defaultErrorMessage: "Erro interno",
    timeoutCode: "UNAVAILABLE",
    timeoutMessage: "Serviço de catálogo indisponível (tempo limite excedido)",
  })

  constructor(
    @Inject(CATALOG_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.catalogService =
      this.client.getService<CatalogServiceClient>("CatalogService")
  }

  async categories(): Promise<Category[]> {
    try {
      const response = await this.caller.call(
        this.catalogService.listCategories({}),
      )
      return (response.categories ?? []).map(toCategory)
    } catch {
      return []
    }
  }

  async tracks(userCode?: string): Promise<Track[]> {
    const response = await this.caller.call(
      this.catalogService.listTracks({ userCode: userCode ?? "" }),
    )
    return (response.tracks ?? []).map(toTrack)
  }

  async track(slug: string, userCode?: string): Promise<TrackDetail | null> {
    return this.caller.callNullable(
      this.catalogService.getTrack({ slug, userCode: userCode ?? "" }),
      toTrackDetail,
      NOT_FOUND_CODES,
    )
  }

  async lesson(
    trackSlug: string,
    lessonSlug: string,
    userCode?: string,
  ): Promise<LessonDetail | null> {
    return this.caller.callNullable(
      this.catalogService.getLesson({
        trackSlug,
        lessonSlug,
        userCode: userCode ?? "",
      }),
      toLessonDetail,
      NOT_FOUND_CODES,
    )
  }

  async section(
    trackSlug: string,
    lessonSlug: string,
    sectionSlug: string,
    userCode?: string,
  ): Promise<SectionDetail | null> {
    return this.caller.callNullable(
      this.catalogService.getSection({
        trackSlug,
        lessonSlug,
        sectionSlug,
        userCode: userCode ?? "",
      }),
      toSectionDetail,
      NOT_FOUND_CODES,
    )
  }

  async enrollInTrack(userCode: string, trackId: number): Promise<boolean> {
    await this.caller.call(
      this.catalogService.enrollUser({ userCode, trackId }),
    )
    return true
  }
}

function toCategory(category: GrpcCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    color: category.color,
  }
}

function toTrack(track: GrpcTrack): Track {
  return {
    id: track.id,
    slug: track.slug,
    title: track.title,
    description: track.description || null,
    category: track.category ? toCategory(track.category) : null,
    lessonCount: track.lessonCount ?? 0,
    enrolled: track.enrolled ?? false,
  }
}

function toTrackDetail(track: GrpcTrackDetail): TrackDetail {
  return {
    id: track.id,
    slug: track.slug,
    title: track.title,
    description: track.description || null,
    category: track.category ? toCategory(track.category) : null,
    lessons: (track.lessons ?? []).map(toLessonSummary),
    enrolled: track.enrolled ?? false,
  }
}

function toLessonSummary(lesson: GrpcLessonSummary): LessonSummary {
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    position: lesson.position ?? 0,
    completed: lesson.completed ?? false,
  }
}

function toLessonDetail(lesson: GrpcLessonDetail): LessonDetail {
  return {
    id: lesson.id,
    trackSlug: lesson.trackSlug,
    lessonSlug: lesson.lessonSlug,
    title: lesson.title,
    sections: (lesson.sections ?? []).map(toSectionSummary),
  }
}

function toSectionSummary(section: GrpcSectionSummary): SectionSummary {
  return {
    id: section.id,
    slug: section.slug,
    title: section.title,
    position: section.position ?? 0,
    kind: toSectionKind(section.kind),
    completed: section.completed ?? false,
  }
}

function toSectionDetail(section: GrpcSectionDetail): SectionDetail {
  return {
    id: section.id,
    slug: section.slug,
    title: section.title,
    kind: toSectionKind(section.kind),
    contentMarkdown: section.contentMarkdown ?? "",
  }
}

function toSectionKind(kind?: string): SectionKind {
  return kind === SectionKind.EXERCISE ? SectionKind.EXERCISE : SectionKind.TEXT
}
