import type { Observable } from "rxjs"

/**
 * Tipos de resposta do `mio.catalog.v1` como chegam pelo proto-loader: campos
 * proto3 com valor default (string vazia, 0, false, repeated vazio) são
 * omitidos da mensagem, então quase tudo é opcional aqui — o `CatalogService`
 * normaliza os defaults ao mapear para os models GraphQL.
 */
export interface GrpcTrack {
  slug: string
  title: string
  description?: string
  lessonCount?: number
  enrolled?: boolean
}

export interface GrpcLessonSummary {
  slug: string
  title: string
  position?: number
  completed?: boolean
}

export interface GrpcTrackDetail {
  slug: string
  title: string
  description?: string
  lessons?: GrpcLessonSummary[]
  enrolled?: boolean
}

export interface GrpcSectionSummary {
  slug: string
  title: string
  position?: number
  kind?: string
  completed?: boolean
}

export interface GrpcLessonDetail {
  trackSlug: string
  lessonSlug: string
  title: string
  sections?: GrpcSectionSummary[]
}

export interface GrpcSectionDetail {
  slug: string
  title: string
  kind?: string
  contentMarkdown?: string
}

/** Espelha `CatalogService` do `mio.catalog.v1` (proto em `@mio/grpc-contracts`). */
export interface CatalogServiceClient {
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
    trackSlug: string
  }): Observable<{ ok?: boolean }>
}
