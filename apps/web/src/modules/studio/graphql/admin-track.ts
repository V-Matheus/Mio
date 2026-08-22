import { graphql } from "@/shared/gql/generated"

export const ADMIN_TRACK_QUERY = graphql(`
  query AdminTrack($slug: ID!) {
    adminTrack(slug: $slug) {
      id
      slug
      title
      description
      creatorCode
      category {
        id
        slug
        name
        color
      }
      lessons {
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
  }
`)
