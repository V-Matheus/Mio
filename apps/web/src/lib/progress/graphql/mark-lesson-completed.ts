import { gql } from "graphql-request"

export const MARK_LESSON_COMPLETED_MUTATION = gql`
  mutation MarkLessonCompleted($lessonId: Int!) {
    markLessonCompleted(lessonId: $lessonId)
  }
`
