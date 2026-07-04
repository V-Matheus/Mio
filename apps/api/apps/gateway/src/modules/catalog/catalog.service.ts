import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { GraphQLError } from "graphql"
import { firstValueFrom, type Observable } from "rxjs"
import { CATALOG_PACKAGE_TOKEN } from "../../grpc/registry"
import { LessonDetail } from "./models/lesson-detail.model"
import { LessonSummary } from "./models/lesson-summary.model"
import { SectionDetail } from "./models/section-detail.model"
import { SectionKind } from "./models/section-kind.enum"
import { SectionSummary } from "./models/section-summary.model"
import { Track } from "./models/track.model"
import { TrackDetail } from "./models/track-detail.model"
import type {
  CatalogServiceClient,
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

  constructor(
    @Inject(CATALOG_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.catalogService =
      this.client.getService<CatalogServiceClient>("CatalogService")
  }

  async tracks(userCode?: string): Promise<Track[]> {
    const response = await this.call(
      this.catalogService.listTracks({ userCode: userCode ?? "" }),
    )
    return (response.tracks ?? []).map(toTrack)
  }

  async track(slug: string, userCode?: string): Promise<TrackDetail | null> {
    return this.callNullable(
      this.catalogService.getTrack({ slug, userCode: userCode ?? "" }),
      toTrackDetail,
    )
  }

  async lesson(
    trackSlug: string,
    lessonSlug: string,
    userCode?: string,
  ): Promise<LessonDetail | null> {
    return this.callNullable(
      this.catalogService.getLesson({
        trackSlug,
        lessonSlug,
        userCode: userCode ?? "",
      }),
      toLessonDetail,
    )
  }

  async section(
    trackSlug: string,
    lessonSlug: string,
    sectionSlug: string,
  ): Promise<SectionDetail | null> {
    return this.callNullable(
      this.catalogService.getSection({ trackSlug, lessonSlug, sectionSlug }),
      toSectionDetail,
    )
  }

  async enrollInTrack(userCode: string, trackSlug: string): Promise<boolean> {
    await this.call(this.catalogService.enrollUser({ userCode, trackSlug }))
    return true
  }

  private async call<T>(source: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(source)
    } catch (error) {
      throw mapGrpcError(error)
    }
  }

  private async callNullable<T, R>(
    source: Observable<T>,
    map: (response: T) => R,
  ): Promise<R | null> {
    try {
      return map(await firstValueFrom(source))
    } catch (error) {
      const mapped = mapGrpcError(error)
      if (NOT_FOUND_CODES.has(mapped.extensions.code as string)) {
        return null
      }
      throw mapped
    }
  }
}

function toTrack(track: GrpcTrack): Track {
  return {
    slug: track.slug,
    title: track.title,
    description: track.description || null,
    lessonCount: track.lessonCount ?? 0,
    enrolled: track.enrolled ?? false,
  }
}

function toTrackDetail(track: GrpcTrackDetail): TrackDetail {
  return {
    slug: track.slug,
    title: track.title,
    description: track.description || null,
    lessons: (track.lessons ?? []).map(toLessonSummary),
    enrolled: track.enrolled ?? false,
  }
}

function toLessonSummary(lesson: GrpcLessonSummary): LessonSummary {
  return {
    slug: lesson.slug,
    title: lesson.title,
    position: lesson.position ?? 0,
    completed: lesson.completed ?? false,
  }
}

function toLessonDetail(lesson: GrpcLessonDetail): LessonDetail {
  return {
    trackSlug: lesson.trackSlug,
    lessonSlug: lesson.lessonSlug,
    title: lesson.title,
    sections: (lesson.sections ?? []).map(toSectionSummary),
  }
}

function toSectionSummary(section: GrpcSectionSummary): SectionSummary {
  return {
    slug: section.slug,
    title: section.title,
    position: section.position ?? 0,
    kind: toSectionKind(section.kind),
    completed: section.completed ?? false,
  }
}

function toSectionDetail(section: GrpcSectionDetail): SectionDetail {
  return {
    slug: section.slug,
    title: section.title,
    kind: toSectionKind(section.kind),
    contentMarkdown: section.contentMarkdown ?? "",
  }
}

function toSectionKind(kind?: string): SectionKind {
  return kind === SectionKind.EXERCISE ? SectionKind.EXERCISE : SectionKind.TEXT
}

function mapGrpcError(error: unknown): GraphQLError {
  const details = (error as { details?: string })?.details
  const code = details && details in ERROR_MESSAGES ? details : "INTERNAL_ERROR"
  return new GraphQLError(ERROR_MESSAGES[code] ?? "Erro interno", {
    extensions: { code },
  })
}
