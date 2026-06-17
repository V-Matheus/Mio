import { graphql } from "@/lib/gql/generated"

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
    }
  }
`)
