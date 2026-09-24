import { graphql } from "@/shared/gql/generated"

export const RESET_PASSWORD_MUTATION = graphql(`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`)
