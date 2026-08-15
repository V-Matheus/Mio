import { graphql } from "@/lib/gql/generated"

export const REFRESH_TOKEN_MUTATION = graphql(`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
        code
        email
        name
        avatarUrl
        roles
      }
    }
  }
`)
