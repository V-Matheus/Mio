import { gql } from "graphql-request"

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`
