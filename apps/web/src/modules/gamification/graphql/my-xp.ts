import { graphql } from "@/shared/gql/generated"

export const MY_XP_QUERY = graphql(`
  query MyXp {
    myXp {
      total
      level
      progressToNext
      xpToNextLevel
      rank
    }
  }
`)
