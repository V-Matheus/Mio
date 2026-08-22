import { graphql } from "@/shared/gql/generated"

export const ENROLL_IN_TRACK_MUTATION = graphql(`
  mutation EnrollInTrack($trackId: Int!) {
    enrollInTrack(trackId: $trackId)
  }
`)
