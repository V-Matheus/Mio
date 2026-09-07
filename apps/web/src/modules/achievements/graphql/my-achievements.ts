import { graphql } from "@/shared/gql/generated"

export const MY_ACHIEVEMENTS_QUERY = graphql(`
  query MyAchievements($limit: Int, $offset: Int) {
    myAchievements(limit: $limit, offset: $offset) {
      items {
        slug
        title
        description
        iconUrl
        unlocked
        unlockedAt
        progress
        threshold
      }
      total
      unlockedTotal
    }
  }
`)
