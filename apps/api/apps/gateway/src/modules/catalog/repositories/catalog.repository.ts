import type { Observable } from "rxjs"

export interface GrpcCategory {
  id: string
  slug: string
  name: string
  color: string
}

export interface GrpcTrack {
  id: number
  slug: string
  title: string
  description?: string
  category?: GrpcCategory
  lessonCount?: number
  enrolled?: boolean
}

export interface GrpcLessonSummary {
  id: number
  slug: string
  title: string
  position?: number
  completed?: boolean
}

export interface GrpcTrackDetail {
  id: number
  slug: string
  title: string
  description?: string
  category?: GrpcCategory
  lessons?: GrpcLessonSummary[]
  enrolled?: boolean
}

export interface GrpcSectionSummary {
  id: number
  slug: string
  title: string
  position?: number
  kind?: string
  completed?: boolean
}

export interface GrpcLessonDetail {
  id: number
  trackSlug: string
  lessonSlug: string
  title: string
  sections?: GrpcSectionSummary[]
}

export interface GrpcSectionDetail {
  id: number
  slug: string
  title: string
  kind?: string
  contentMarkdown?: string
}

/** Espelha `CatalogService` do `mio.catalog.v1` (proto em `@mio/grpc-contracts`). */
export interface CatalogServiceClient {
  listCategories(
    data: Record<string, never>,
  ): Observable<{ categories?: GrpcCategory[] }>

  listTracks(data: { userCode: string }): Observable<{ tracks?: GrpcTrack[] }>

  getTrack(data: {
    slug: string
    userCode: string
  }): Observable<GrpcTrackDetail>

  getLesson(data: {
    trackSlug: string
    lessonSlug: string
    userCode: string
  }): Observable<GrpcLessonDetail>

  getSection(data: {
    trackSlug: string
    lessonSlug: string
    sectionSlug: string
  }): Observable<GrpcSectionDetail>

  enrollUser(data: {
    userCode: string
    trackId: number
  }): Observable<{ ok?: boolean }>
}
