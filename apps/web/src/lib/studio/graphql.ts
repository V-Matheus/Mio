import { graphql } from "@/lib/gql/generated"

export const ADMIN_TRACKS_QUERY = graphql(`
  query AdminTracks {
    adminTracks {
      slug
      title
      description
      creatorCode
      lessonCount
    }
  }
`)

export const ADMIN_TRACK_QUERY = graphql(`
  query AdminTrack($slug: ID!) {
    adminTrack(slug: $slug) {
      slug
      title
      description
      creatorCode
      lessons {
        slug
        title
        position
        sections {
          slug
          title
          position
          kind
          contentMarkdown
        }
      }
    }
  }
`)

export const CREATE_TRACK_MUTATION = graphql(`
  mutation CreateTrack($input: CreateTrackInput!) {
    createTrack(input: $input) {
      slug
      title
      description
      creatorCode
      lessonCount
    }
  }
`)

export const UPDATE_TRACK_MUTATION = graphql(`
  mutation UpdateTrack($slug: ID!, $input: UpdateTrackInput!) {
    updateTrack(slug: $slug, input: $input) {
      slug
      title
      description
    }
  }
`)

export const DELETE_TRACK_MUTATION = graphql(`
  mutation DeleteTrack($slug: ID!) {
    deleteTrack(slug: $slug)
  }
`)

export const UPSERT_LESSON_MUTATION = graphql(`
  mutation UpsertLesson($input: UpsertLessonInput!) {
    upsertLesson(input: $input)
  }
`)

export const DELETE_LESSON_MUTATION = graphql(`
  mutation DeleteLesson($trackSlug: ID!, $lessonSlug: ID!) {
    deleteLesson(trackSlug: $trackSlug, lessonSlug: $lessonSlug)
  }
`)

export const UPSERT_SECTION_MUTATION = graphql(`
  mutation UpsertSection($input: UpsertSectionInput!) {
    upsertSection(input: $input)
  }
`)

export const DELETE_SECTION_MUTATION = graphql(`
  mutation DeleteSection($trackSlug: ID!, $lessonSlug: ID!, $sectionSlug: ID!) {
    deleteSection(trackSlug: $trackSlug, lessonSlug: $lessonSlug, sectionSlug: $sectionSlug)
  }
`)
