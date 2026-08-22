import { graphql } from "@/shared/gql/generated"

export const REGISTER_MUTATION = graphql(`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
    }
  }
`)
