import { gql } from "graphql-request"

export const GET_LESSON_PROGRESS_QUERY = gql`
  query GetLessonProgress($lessonId: Int!) {
    lessonProgress(lessonId: $lessonId) {
      lastSectionId
      completedAt
      viewedSectionIds
    }
  }
`
