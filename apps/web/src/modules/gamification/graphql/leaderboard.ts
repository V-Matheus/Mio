import { graphql } from "@/shared/gql/generated"

export const LEADERBOARD_QUERY = graphql(`
  query Leaderboard($limit: Int, $offset: Int) {
    leaderboard(limit: $limit, offset: $offset) {
      userCode
      name
      avatarUrl
      total
      rank
      level
    }
  }
`)
