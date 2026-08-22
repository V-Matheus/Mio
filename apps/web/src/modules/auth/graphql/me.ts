import { graphql } from "@/shared/gql/generated"

export const ME_QUERY = graphql(`
  query Me {
    me {
      code
      email
      name
      avatarUrl
      roles
    }
  }
`)
