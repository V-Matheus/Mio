import { graphql } from "@/shared/gql/generated"

export const GET_TRACK_QUERY = graphql(`
  query GetTrack($slug: ID!) {
    track(slug: $slug) {
      id
      slug
      title
      description
      enrolled
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
        completed
      }
    }
  }
`)
