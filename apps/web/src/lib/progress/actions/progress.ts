"use server"

import { revalidatePath } from "next/cache"
import {
  type MarkSectionViewedResponse,
  markLessonCompleted,
  markSectionViewed,
} from "@/lib/progress/service"

export async function markSectionViewedAction(
  sectionId: number,
  trackSlug?: string,
  lessonSlug?: string,
): Promise<MarkSectionViewedResponse> {
  const result = await markSectionViewed(sectionId)
  if (result.ok) {
    if (trackSlug) {
      revalidatePath(`/trilhas/${trackSlug}`)
      if (lessonSlug) {
        revalidatePath(`/trilhas/${trackSlug}/aula/${lessonSlug}`)
      }
    }
  }
  return result
}

export async function markLessonCompletedAction(
  lessonId: number,
  trackSlug?: string,
  lessonSlug?: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await markLessonCompleted(lessonId)
  if (result.ok) {
    if (trackSlug) {
      revalidatePath(`/trilhas/${trackSlug}`)
      if (lessonSlug) {
        revalidatePath(`/trilhas/${trackSlug}/aula/${lessonSlug}`)
      }
    }
  }
  return result
}
