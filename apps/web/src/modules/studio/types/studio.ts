import type { Category } from "@/modules/catalog/types"

export interface AdminSectionSummary {
  id: number
  slug: string
  title: string
  position: number
  kind: "TEXT" | "EXERCISE"
  contentMarkdown: string
}

export interface AdminLessonSummary {
  id: number
  slug: string
  title: string
  position: number
  sections: AdminSectionSummary[]
}

export interface AdminTrack {
  id: number
  slug: string
  title: string
  description?: string | null
  category?: Category | null
  creatorCode: string
  lessonCount: number
}

export interface AdminTrackDetail {
  id: number
  slug: string
  title: string
  description?: string | null
  category?: Category | null
  creatorCode: string
  lessons: AdminLessonSummary[]
}

export interface CreateTrackInput {
  title: string
  description?: string | null
  categoryId?: string | null
}

export interface UpdateTrackInput {
  title: string
  description?: string | null
  categoryId?: string | null
}

export interface UpsertLessonInput {
  trackId: number
  id?: number | null
  title: string
  position?: number | null
}

export interface UpsertSectionInput {
  lessonId: number
  id?: number | null
  title: string
  position?: number | null
  kind?: "TEXT" | "EXERCISE" | null
  contentMarkdown?: string | null
}
