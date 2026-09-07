import "server-only"

import { GET_HOME_DATA_QUERY } from "@/modules/home/graphql"
import type { HomeData } from "@/modules/home/types"
import { gatewayError, getGatewayClient } from "@/shared/gateway/client"

export async function getHomeData(): Promise<HomeData | null> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(GET_HOME_DATA_QUERY)
    if (!data.profile) return null

    return {
      user: {
        code: data.profile.user.code,
        name: data.profile.user.name,
        email: data.profile.user.email,
        avatarUrl: data.profile.user.avatarUrl ?? null,
        roles: data.profile.user.roles ?? [],
      },
      xp: {
        total: data.profile.xp.total,
        level: data.profile.xp.level,
        progressToNext: data.profile.xp.progressToNext,
        xpToNextLevel: data.profile.xp.xpToNextLevel,
        rank: data.profile.xp.rank,
      },
      streak: {
        streakCurrent: data.profile.streak.streakCurrent,
        streakBest: data.profile.streak.streakBest,
        lastStudyDate: data.profile.streak.lastStudyDate ?? null,
      },
      stats: {
        totalCompletedLessons: data.profile.stats.totalCompletedLessons,
        completedTracksCount: data.profile.stats.completedTracksCount,
      },
      inProgressTracks: (data.profile.inProgressTracks ?? []).map((t) => ({
        trackId: t.trackId,
        trackSlug: t.trackSlug,
        trackTitle: t.trackTitle,
        totalLessons: t.totalLessons,
        completedLessons: t.completedLessons,
        progressPercentage: t.progressPercentage,
        currentLessonSlug: t.currentLessonSlug ?? null,
        currentLessonTitle: t.currentLessonTitle ?? null,
      })),
      recentActivities: (data.profile.recentActivities ?? []).map((a) => ({
        lessonId: a.lessonId,
        lessonSlug: a.lessonSlug,
        lessonTitle: a.lessonTitle,
        trackSlug: a.trackSlug,
        trackTitle: a.trackTitle,
        completedAt: a.completedAt,
      })),
    }
  } catch (error) {
    await gatewayError(error, "Falha ao carregar dados da Home")
    return null
  }
}
