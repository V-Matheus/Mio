import { graphql } from "@/lib/gql/generated"

export const UPSERT_SECTION_MUTATION = graphql(`
  mutation UpsertSection($input: UpsertSectionInput!) {
    upsertSection(input: $input) {
      id
      slug
      title
      position
      kind
      contentMarkdown
    }
  }
`)
