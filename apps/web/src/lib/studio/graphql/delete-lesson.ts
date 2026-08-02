import { graphql } from "@/lib/gql/generated"

export const DELETE_LESSON_MUTATION = graphql(`
  mutation DeleteLesson($id: Int!) {
    deleteLesson(id: $id)
  }
`)
