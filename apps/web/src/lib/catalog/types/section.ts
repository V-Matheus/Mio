export interface SectionSummary {
  id: number
  slug: string
  title: string
  position: number
  kind: "TEXT" | "EXERCISE"
  completed: boolean
}

export interface SectionDetail {
  id: number
  slug: string
  title: string
  kind: "TEXT" | "EXERCISE"
  contentMarkdown: string
}
