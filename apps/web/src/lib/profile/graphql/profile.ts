import { graphql } from "@/lib/gql/generated"

export const GET_PROFILE_QUERY = graphql(`
  query GetProfile {
    profile {
      user {
        code
        name
        email
        avatarUrl
        roles
      }
      xp {
        total
        level
        progressToNext
        xpToNextLevel
        rank
      }
      streak {
        streakCurrent
        streakBest
        lastStudyDate
      }
      stats {
        totalCompletedLessons
        completedTracksCount
      }
      weeklyXp {
        days {
          day
          date
          xp
        }
        totalWeeklyXp
      }
      inProgressTracks {
        trackId
        trackSlug
        trackTitle
        totalLessons
        completedLessons
        progressPercentage
        currentLessonSlug
        currentLessonTitle
      }
      recentActivities {
        lessonId
        lessonSlug
        lessonTitle
        trackSlug
        trackTitle
        completedAt
      }
    }
  }
`)
