import { graphql } from "@/lib/gql/generated"

export const CREATE_TRACK_MUTATION = graphql(`
  mutation CreateTrack($input: CreateTrackInput!) {
    createTrack(input: $input) {
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
