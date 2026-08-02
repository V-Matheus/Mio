import { getLesson } from "@/lib/catalog/service"
import type { LessonDetail } from "@/lib/catalog/types"

export async function getLessonQuery(
  trackSlug: string,
  lessonSlug: string,
): Promise<LessonDetail | null> {
  return getLesson(trackSlug, lessonSlug)
}
