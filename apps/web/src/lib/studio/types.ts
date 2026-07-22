export interface AdminSectionSummary {
  slug: string
  title: string
  position: number
  kind: "TEXT" | "EXERCISE"
  contentMarkdown: string
}

export interface AdminLessonSummary {
  slug: string
  title: string
  position: number
  sections: AdminSectionSummary[]
}

export interface AdminTrack {
  slug: string
  title: string
  description: string | null
  creatorCode: string
  lessonCount: number
}

export interface AdminTrackDetail {
  slug: string
  title: string
  description: string | null
  creatorCode: string
  lessons: AdminLessonSummary[]
}
