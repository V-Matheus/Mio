import "server-only"

import {
  ENROLL_IN_TRACK_MUTATION,
  GET_LESSON_QUERY,
  GET_SECTION_QUERY,
  GET_TRACK_QUERY,
  LIST_CATEGORIES_QUERY,
  LIST_TRACKS_QUERY,
} from "@/modules/catalog/graphql"
import type {
  Category,
  LessonDetail,
  SectionDetail,
  TrackDetail,
  TrackSummary,
} from "@/modules/catalog/types"
import { gatewayError, getGatewayClient } from "@/shared/gateway/client"

export async function getCategories(): Promise<Category[]> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(LIST_CATEGORIES_QUERY)
    return data.categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      color: c.color,
    }))
  } catch (error) {
    await gatewayError(error, "Falha ao carregar categorias")
    return []
  }
}

export async function listTracks(): Promise<TrackSummary[]> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(LIST_TRACKS_QUERY)
    return data.tracks.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description ?? null,
      category: t.category ?? null,
      lessonCount: t.lessonCount,
      enrolled: t.enrolled,
    }))
  } catch (error) {
    await gatewayError(error, "Falha ao carregar trilhas")
    return []
  }
}

export const getTracks = listTracks

export async function getTrack(slug: string): Promise<TrackDetail | null> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(GET_TRACK_QUERY, { slug })
    if (!data.track) return null
    return {
      id: data.track.id,
      slug: data.track.slug,
      title: data.track.title,
      description: data.track.description ?? null,
      category: data.track.category ?? null,
      enrolled: data.track.enrolled,
      lessons: data.track.lessons.map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        position: l.position,
        completed: l.completed,
      })),
    }
  } catch (error) {
    await gatewayError(error, "Falha ao carregar trilha")
    return null
  }
}

export async function getLesson(
  trackSlug: string,
  lessonSlug: string,
): Promise<LessonDetail | null> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(GET_LESSON_QUERY, {
      trackSlug,
      lessonSlug,
    })
    if (!data.lesson) return null
    return {
      id: data.lesson.id,
      trackSlug: data.lesson.trackSlug,
      lessonSlug: data.lesson.lessonSlug,
      title: data.lesson.title,
      sections: data.lesson.sections.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        position: s.position,
        kind: s.kind as "TEXT" | "EXERCISE",
        completed: s.completed,
      })),
    }
  } catch (error) {
    await gatewayError(error, "Falha ao carregar lição")
    return null
  }
}

export async function getSection(
  trackSlug: string,
  lessonSlug: string,
  sectionSlug: string,
): Promise<SectionDetail | null> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(GET_SECTION_QUERY, {
      trackSlug,
      lessonSlug,
      sectionSlug,
    })
    if (!data.section) return null
    return {
      id: data.section.id,
      slug: data.section.slug,
      title: data.section.title,
      kind: data.section.kind as "TEXT" | "EXERCISE",
      contentMarkdown: data.section.contentMarkdown,
    }
  } catch (error) {
    await gatewayError(error, "Falha ao carregar seção")
    return null
  }
}

export async function enrollInTrack(
  trackId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(ENROLL_IN_TRACK_MUTATION, { trackId })
    if (data.enrollInTrack) {
      return { ok: true }
    }
    return { ok: false, error: "Não foi possível realizar a matrícula." }
  } catch (error) {
    return {
      ok: false,
      error: await gatewayError(error, "Falha ao se matricular na trilha"),
    }
  }
}
