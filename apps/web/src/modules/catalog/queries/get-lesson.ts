import { getLesson } from "@/modules/catalog/services"
import type { LessonDetail } from "@/modules/catalog/types"

export async function getLessonQuery(
  trackSlug: string,
  lessonSlug: string,
): Promise<LessonDetail | null> {
  return getLesson(trackSlug, lessonSlug)
}
