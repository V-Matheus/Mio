import { gql } from "graphql-request"

export const UPSERT_OAUTH_MUTATION = gql`
  mutation UpsertOAuthUser($input: UpsertOAuthInput!) {
    upsertOAuthUser(input: $input) {
      accessToken
    }
  }
`
