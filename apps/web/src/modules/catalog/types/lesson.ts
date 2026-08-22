import type { SectionSummary } from "./section"

export interface LessonSummary {
  id: number
  slug: string
  title: string
  position: number
  completed: boolean
}

export interface LessonDetail {
  id: number
  trackSlug: string
  lessonSlug: string
  title: string
  sections: SectionSummary[]
}
