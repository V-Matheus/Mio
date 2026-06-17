import { graphql } from "@/lib/gql/generated"

export const UPSERT_OAUTH_MUTATION = graphql(`
  mutation UpsertOAuthUser($input: UpsertOAuthInput!) {
    upsertOAuthUser(input: $input) {
      accessToken
    }
  }
`)
