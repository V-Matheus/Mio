import "server-only"

import { gatewayError, getGatewayClient } from "@/lib/gateway/client"
import { GET_PROFILE_QUERY } from "./graphql"
import type { UserProfile } from "./types"

export async function getProfile(
  userCode?: string,
): Promise<UserProfile | null> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(GET_PROFILE_QUERY, { userCode })
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
      weeklyXp: {
        days: (data.profile.weeklyXp.days ?? []).map((d) => ({
          day: d.day,
          date: d.date,
          xp: d.xp,
        })),
        totalWeeklyXp: data.profile.weeklyXp.totalWeeklyXp,
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
    await gatewayError(error, "Falha ao carregar perfil do usuário")
    return null
  }
}
