import { graphql } from "@/lib/gql/generated"

export const DELETE_TRACK_MUTATION = graphql(`
  mutation DeleteTrack($id: Int!) {
    deleteTrack(id: $id)
  }
`)
