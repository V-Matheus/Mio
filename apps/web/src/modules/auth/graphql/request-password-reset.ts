import { graphql } from "@/shared/gql/generated"

export const REQUEST_PASSWORD_RESET_MUTATION = graphql(`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`)
