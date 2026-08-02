import { graphql } from "@/lib/gql/generated"

export const LIST_TRACKS_QUERY = graphql(`
  query ListTracks {
    tracks {
      id
      slug
      title
      description
      lessonCount
      enrolled
      category {
        id
        slug
        name
        color
      }
    }
  }
`)
