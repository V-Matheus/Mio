import { graphql } from "@/shared/gql/generated"

export const DELETE_SECTION_MUTATION = graphql(`
  mutation DeleteSection($id: Int!) {
    deleteSection(id: $id)
  }
`)
