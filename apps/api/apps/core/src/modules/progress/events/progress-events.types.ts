export const ProgressEventRoutingKey = {
  LessonCompleted: "lesson.completed",
} as const

export type ProgressEventRoutingKey =
  (typeof ProgressEventRoutingKey)[keyof typeof ProgressEventRoutingKey]

export interface LessonCompletedEventPayload {
  userCode: string
  trackSlug: string
  lessonSlug: string
  lessonId: string
  trackId: string
  completedAt: string
}
