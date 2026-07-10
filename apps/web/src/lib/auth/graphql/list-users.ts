import { graphql } from "@/lib/gql/generated"

export const LIST_USERS_QUERY = graphql(`
  query ListUsers($search: String) {
    listUsers(search: $search) {
      code
      email
      name
      avatarUrl
      roles
    }
  }
`)
