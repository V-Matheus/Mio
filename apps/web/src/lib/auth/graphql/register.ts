import { graphql } from "@/lib/gql/generated"

export const REGISTER_MUTATION = graphql(`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
    }
  }
`)
