import { gql } from "graphql-request"

export const MARK_SECTION_VIEWED_MUTATION = gql`
  mutation MarkSectionViewed($sectionId: Int!) {
    markSectionViewed(sectionId: $sectionId) {
      ok
      lessonCompleted
    }
  }
`
