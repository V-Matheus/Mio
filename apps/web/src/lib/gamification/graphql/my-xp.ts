import { graphql } from "@/lib/gql/generated"

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
