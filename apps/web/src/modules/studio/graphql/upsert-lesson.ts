import { graphql } from "@/shared/gql/generated"

export const UPSERT_LESSON_MUTATION = graphql(`
  mutation UpsertLesson($input: UpsertLessonInput!) {
    upsertLesson(input: $input) {
      id
      slug
      title
      position
      sections {
        id
        slug
        title
        position
        kind
        contentMarkdown
      }
    }
  }
`)
