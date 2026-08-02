import { graphql } from "@/lib/gql/generated"

export const UPDATE_TRACK_MUTATION = graphql(`
  mutation UpdateTrack($id: Int!, $input: UpdateTrackInput!) {
    updateTrack(id: $id, input: $input) {
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
