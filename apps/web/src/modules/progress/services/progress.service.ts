import "server-only"

import {
  GET_LESSON_PROGRESS_QUERY,
  MARK_LESSON_COMPLETED_MUTATION,
  MARK_SECTION_VIEWED_MUTATION,
} from "@/modules/progress/graphql"
import { gatewayError, getGatewayClient } from "@/shared/gateway/client"

export type MarkSectionViewedResponse = {
  ok: boolean
  lessonCompleted: boolean
  error?: string
}

export type LessonProgressData = {
  lastSectionId?: number
  completedAt?: string
  viewedSectionIds: number[]
}

export async function markSectionViewed(
  sectionId: number,
): Promise<MarkSectionViewedResponse> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(MARK_SECTION_VIEWED_MUTATION, {
      sectionId,
    })
    return {
      ok: data.markSectionViewed.ok,
      lessonCompleted: data.markSectionViewed.lessonCompleted,
    }
  } catch (error) {
    return {
      ok: false,
      lessonCompleted: false,
      error: await gatewayError(error, "Falha ao marcar seção como vista"),
    }
  }
}

export async function markLessonCompleted(
  lessonId: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(MARK_LESSON_COMPLETED_MUTATION, {
      lessonId,
    })
    return { ok: data.markLessonCompleted }
  } catch (error) {
    return {
      ok: false,
      error: await gatewayError(error, "Falha ao marcar lição como concluída"),
    }
  }
}

export async function getLessonProgress(
  lessonId: number,
): Promise<LessonProgressData | null> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(GET_LESSON_PROGRESS_QUERY, {
      lessonId,
    })
    if (!data.lessonProgress) return null
    return {
      lastSectionId: data.lessonProgress.lastSectionId ?? undefined,
      completedAt: data.lessonProgress.completedAt ?? undefined,
      viewedSectionIds: data.lessonProgress.viewedSectionIds ?? [],
    }
  } catch {
    return null
  }
}
