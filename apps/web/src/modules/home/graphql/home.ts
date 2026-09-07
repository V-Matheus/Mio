import { graphql } from "@/shared/gql/generated"

export const GET_HOME_DATA_QUERY = graphql(`
  query GetHomeData {
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
