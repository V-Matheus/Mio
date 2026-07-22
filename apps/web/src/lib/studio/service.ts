import { gatewayError, getGatewayClient } from "@/lib/gateway/client"
import {
  ADMIN_TRACK_QUERY,
  ADMIN_TRACKS_QUERY,
  CREATE_TRACK_MUTATION,
  DELETE_LESSON_MUTATION,
  DELETE_SECTION_MUTATION,
  DELETE_TRACK_MUTATION,
  UPDATE_TRACK_MUTATION,
  UPSERT_LESSON_MUTATION,
  UPSERT_SECTION_MUTATION,
} from "./graphql"
import type { AdminTrack, AdminTrackDetail } from "./types"

export const studioService = {
  async listTracks(
    accessToken?: string,
  ): Promise<
    { ok: true; tracks: AdminTrack[] } | { ok: false; error: string }
  > {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(ADMIN_TRACKS_QUERY)
      return {
        ok: true,
        tracks: (data.adminTracks || []).map((t) => ({
          slug: t.slug,
          title: t.title,
          description: t.description ?? null,
          creatorCode: t.creatorCode,
          lessonCount: t.lessonCount,
        })),
      }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao carregar trilhas do estúdio"),
      }
    }
  },

  async getTrack(
    slug: string,
    accessToken?: string,
  ): Promise<
    { ok: true; track: AdminTrackDetail | null } | { ok: false; error: string }
  > {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(ADMIN_TRACK_QUERY, { slug })
      if (!data.adminTrack) {
        return { ok: true, track: null }
      }

      return {
        ok: true,
        track: {
          slug: data.adminTrack.slug,
          title: data.adminTrack.title,
          description: data.adminTrack.description ?? null,
          creatorCode: data.adminTrack.creatorCode,
          lessons: (data.adminTrack.lessons || []).map((l) => ({
            slug: l.slug,
            title: l.title,
            position: l.position,
            sections: (l.sections || []).map((s) => ({
              slug: s.slug,
              title: s.title,
              position: s.position,
              kind: s.kind === "EXERCISE" ? "EXERCISE" : "TEXT",
              contentMarkdown: s.contentMarkdown,
            })),
          })),
        },
      }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao carregar detalhe da trilha"),
      }
    }
  },

  async createTrack(
    title: string,
    description?: string,
    accessToken?: string,
  ): Promise<{ ok: true; track: AdminTrack } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(CREATE_TRACK_MUTATION, {
        input: { title, description },
      })
      return {
        ok: true,
        track: {
          slug: data.createTrack.slug,
          title: data.createTrack.title,
          description: data.createTrack.description ?? null,
          creatorCode: data.createTrack.creatorCode,
          lessonCount: data.createTrack.lessonCount,
        },
      }
    } catch (error) {
      return { ok: false, error: gatewayError(error, "Falha ao criar trilha") }
    }
  },

  async updateTrack(
    slug: string,
    title: string,
    description?: string,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(UPDATE_TRACK_MUTATION, {
        slug,
        input: { title, description },
      })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao atualizar trilha"),
      }
    }
  },

  async deleteTrack(
    slug: string,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(DELETE_TRACK_MUTATION, { slug })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao excluir trilha"),
      }
    }
  },

  async upsertLesson(
    trackSlug: string,
    title: string,
    slug?: string,
    position?: number,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(UPSERT_LESSON_MUTATION, {
        input: { trackSlug, title, slug, position },
      })
      return { ok: true }
    } catch (error) {
      return { ok: false, error: gatewayError(error, "Falha ao salvar aula") }
    }
  },

  async deleteLesson(
    trackSlug: string,
    lessonSlug: string,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(DELETE_LESSON_MUTATION, {
        trackSlug,
        lessonSlug,
      })
      return { ok: true }
    } catch (error) {
      return { ok: false, error: gatewayError(error, "Falha ao excluir aula") }
    }
  },

  async upsertSection(
    trackSlug: string,
    lessonSlug: string,
    title: string,
    slug?: string,
    position?: number,
    kind?: "TEXT" | "EXERCISE",
    contentMarkdown?: string,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(UPSERT_SECTION_MUTATION, {
        input: {
          trackSlug,
          lessonSlug,
          title,
          slug,
          position,
          kind: kind === "EXERCISE" ? "EXERCISE" : "TEXT",
          contentMarkdown,
        },
      })
      return { ok: true }
    } catch (error) {
      return { ok: false, error: gatewayError(error, "Falha ao salvar seção") }
    }
  },

  async deleteSection(
    trackSlug: string,
    lessonSlug: string,
    sectionSlug: string,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(DELETE_SECTION_MUTATION, {
        trackSlug,
        lessonSlug,
        sectionSlug,
      })
      return { ok: true }
    } catch (error) {
      return { ok: false, error: gatewayError(error, "Falha ao excluir seção") }
    }
  },
}
