import { graphql } from "@/shared/gql/generated"

export const GET_LESSON_QUERY = graphql(`
  query GetLesson($trackSlug: ID!, $lessonSlug: ID!) {
    lesson(trackSlug: $trackSlug, lessonSlug: $lessonSlug) {
      id
      trackSlug
      lessonSlug
      title
      sections {
        id
        slug
        title
        position
        kind
        completed
      }
    }
  }
`)
