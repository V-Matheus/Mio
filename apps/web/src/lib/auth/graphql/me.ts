import { gql } from "graphql-request"

export const ME_QUERY = gql`
  query Me {
    me {
      code
      email
      name
      avatarUrl
    }
  }
`
