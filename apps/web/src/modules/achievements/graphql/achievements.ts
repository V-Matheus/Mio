import { graphql } from "@/shared/gql/generated"

export const ACHIEVEMENTS_QUERY = graphql(`
  query Achievements($limit: Int, $offset: Int) {
    achievements(limit: $limit, offset: $offset) {
      items {
        slug
        title
        description
        iconUrl
        ruleType
        threshold
      }
      total
    }
  }
`)
