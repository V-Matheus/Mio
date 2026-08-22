import { graphql } from "@/shared/gql/generated"

export const ADMIN_TRACKS_QUERY = graphql(`
  query AdminTracks {
    adminTracks {
      id
      slug
      title
      description
      creatorCode
      lessonCount
      category {
        id
        slug
        name
        color
      }
    }
  }
`)
