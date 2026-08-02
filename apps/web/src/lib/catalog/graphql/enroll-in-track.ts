import { graphql } from "@/lib/gql/generated"

export const ENROLL_IN_TRACK_MUTATION = graphql(`
  mutation EnrollInTrack($trackId: Int!) {
    enrollInTrack(trackId: $trackId)
  }
`)
