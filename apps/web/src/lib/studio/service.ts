import "server-only"

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
import type {
  AdminLessonSummary,
  AdminSectionSummary,
  AdminTrack,
  AdminTrackDetail,
} from "./types"

export const studioService = {
  async listTracks(accessToken?: string): Promise<AdminTrack[]> {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(ADMIN_TRACKS_QUERY)
      return data.adminTracks.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description ?? null,
        category: t.category ?? null,
        creatorCode: t.creatorCode,
        lessonCount: t.lessonCount,
      }))
    } catch (error) {
      await gatewayError(error, "Falha ao carregar trilhas do studio")
      return []
    }
  },

  async getTrack(
    slug: string,
    accessToken?: string,
  ): Promise<AdminTrackDetail | null> {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(ADMIN_TRACK_QUERY, { slug })
      console.log("data", data)
      if (!data.adminTrack) return null
      return {
        id: data.adminTrack.id,
        slug: data.adminTrack.slug,
        title: data.adminTrack.title,
        description: data.adminTrack.description ?? null,
        category: data.adminTrack.category ?? null,
        creatorCode: data.adminTrack.creatorCode,
        lessons: data.adminTrack.lessons.map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          position: l.position,
          sections: l.sections.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            position: s.position,
            kind: s.kind as "TEXT" | "EXERCISE",
            contentMarkdown: s.contentMarkdown,
          })),
        })),
      }
    } catch (error) {
      await gatewayError(error, "Falha ao carregar detalhe da trilha no studio")
      return null
    }
  },

  async createTrack(
    title: string,
    description?: string,
    categoryId?: string,
    accessToken?: string,
  ): Promise<{ ok: true; track: AdminTrack } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(CREATE_TRACK_MUTATION, {
        input: { title, description, categoryId },
      })
      return {
        ok: true,
        track: {
          id: data.createTrack.id,
          slug: data.createTrack.slug,
          title: data.createTrack.title,
          description: data.createTrack.description ?? null,
          category: data.createTrack.category ?? null,
          creatorCode: data.createTrack.creatorCode,
          lessonCount: data.createTrack.lessonCount,
        },
      }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao criar trilha"),
      }
    }
  },

  async updateTrack(
    id: number,
    title: string,
    description?: string,
    categoryId?: string,
    accessToken?: string,
  ): Promise<{ ok: true; track: AdminTrack } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(UPDATE_TRACK_MUTATION, {
        id,
        input: { title, description, categoryId },
      })
      return {
        ok: true,
        track: {
          id: data.updateTrack.id,
          slug: data.updateTrack.slug,
          title: data.updateTrack.title,
          description: data.updateTrack.description ?? null,
          category: data.updateTrack.category ?? null,
          creatorCode: data.updateTrack.creatorCode,
          lessonCount: data.updateTrack.lessonCount,
        },
      }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao atualizar trilha"),
      }
    }
  },

  async deleteTrack(
    id: number,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(DELETE_TRACK_MUTATION, { id })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao remover trilha"),
      }
    }
  },

  async upsertLesson(
    trackId: number,
    title: string,
    lessonId?: number,
    position?: number,
    accessToken?: string,
  ): Promise<
    { ok: true; lesson: AdminLessonSummary } | { ok: false; error: string }
  > {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(UPSERT_LESSON_MUTATION, {
        input: {
          trackId,
          id: lessonId,
          title,
          position,
        },
      })
      return {
        ok: true,
        lesson: {
          id: data.upsertLesson.id,
          slug: data.upsertLesson.slug,
          title: data.upsertLesson.title,
          position: data.upsertLesson.position,
          sections: data.upsertLesson.sections.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            position: s.position,
            kind: s.kind as "TEXT" | "EXERCISE",
            contentMarkdown: s.contentMarkdown,
          })),
        },
      }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao salvar aula"),
      }
    }
  },

  async deleteLesson(
    id: number,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(DELETE_LESSON_MUTATION, { id })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao remover aula"),
      }
    }
  },

  async upsertSection(
    lessonId: number,
    title: string,
    sectionId?: number,
    position?: number,
    kind?: "TEXT" | "EXERCISE",
    contentMarkdown?: string,
    accessToken?: string,
  ): Promise<
    { ok: true; section: AdminSectionSummary } | { ok: false; error: string }
  > {
    try {
      const client = await getGatewayClient(accessToken)
      const data = await client.request(UPSERT_SECTION_MUTATION, {
        input: {
          lessonId,
          id: sectionId,
          title,
          position,
          kind: kind as "EXERCISE" | "TEXT" | undefined,
          contentMarkdown,
        },
      })
      return {
        ok: true,
        section: {
          id: data.upsertSection.id,
          slug: data.upsertSection.slug,
          title: data.upsertSection.title,
          position: data.upsertSection.position,
          kind: data.upsertSection.kind as "TEXT" | "EXERCISE",
          contentMarkdown: data.upsertSection.contentMarkdown,
        },
      }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao salvar seção"),
      }
    }
  },

  async deleteSection(
    id: number,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(DELETE_SECTION_MUTATION, { id })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao remover seção"),
      }
    }
  },
}
