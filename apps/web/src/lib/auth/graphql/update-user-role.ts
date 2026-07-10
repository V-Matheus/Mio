import { graphql } from "@/lib/gql/generated"

export const UPDATE_USER_ROLE_MUTATION = graphql(`
  mutation UpdateUserRole($userCode: ID!, $role: UserRole!) {
    updateUserRole(userCode: $userCode, role: $role) {
      code
      roles
    }
  }
`)
