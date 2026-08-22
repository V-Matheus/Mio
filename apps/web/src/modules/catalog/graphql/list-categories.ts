import { graphql } from "@/shared/gql/generated"

export const LIST_CATEGORIES_QUERY = graphql(`
  query ListCategories {
    categories {
      id
      slug
      name
      color
    }
  }
`)
