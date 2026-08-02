import { graphql } from "@/lib/gql/generated"

export const DELETE_SECTION_MUTATION = graphql(`
  mutation DeleteSection($id: Int!) {
    deleteSection(id: $id)
  }
`)
