import type { Category } from "./category"
import type { LessonSummary } from "./lesson"

export interface TrackSummary {
  id: number
  slug: string
  title: string
  description?: string | null
  category?: Category | null
  lessonCount: number
  enrolled: boolean
}

export interface TrackDetail {
  id: number
  slug: string
  title: string
  description?: string | null
  category?: Category | null
  enrolled: boolean
  lessons: LessonSummary[]
}
