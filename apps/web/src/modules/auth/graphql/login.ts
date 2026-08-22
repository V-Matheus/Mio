import { graphql } from "@/shared/gql/generated"

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
    }
  }
`)
