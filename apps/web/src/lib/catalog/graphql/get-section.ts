import { graphql } from "@/lib/gql/generated"

export const GET_SECTION_QUERY = graphql(`
  query GetSection($trackSlug: ID!, $lessonSlug: ID!, $sectionSlug: ID!) {
    section(trackSlug: $trackSlug, lessonSlug: $lessonSlug, sectionSlug: $sectionSlug) {
      id
      slug
      title
      kind
      contentMarkdown
    }
  }
`)
