"use server"

import { revalidatePath } from "next/cache"
import { studioService } from "@/modules/studio/services"
import type {
  AdminLessonSummary,
  AdminSectionSummary,
} from "@/modules/studio/types"

export async function createTrackAction(formData: FormData) {
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || undefined
  const categoryId = (formData.get("categoryId") as string) || undefined

  if (!title?.trim()) {
    return { ok: false, error: "Título é obrigatório" }
  }

  if (!categoryId?.trim()) {
    return { ok: false, error: "Categoria é obrigatória" }
  }

  const res = await studioService.createTrack(
    title.trim(),
    description?.trim(),
    categoryId.trim(),
  )

  if (res.ok) {
    revalidatePath("/studio")
  }
  return res
}

export async function updateTrackAction(
  id: number,
  formData: FormData,
  trackSlug?: string,
) {
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || undefined
  const categoryId = (formData.get("categoryId") as string) || undefined

  if (!title?.trim()) {
    return { ok: false, error: "Título é obrigatório" }
  }

  if (!categoryId?.trim()) {
    return { ok: false, error: "Categoria é obrigatória" }
  }

  const res = await studioService.updateTrack(
    id,
    title.trim(),
    description?.trim(),
    categoryId.trim(),
  )

  if (res.ok) {
    revalidatePath("/studio")
    if (trackSlug) {
      revalidatePath(`/studio/${trackSlug}`)
    }
    if (res.track?.slug && res.track.slug !== trackSlug) {
      revalidatePath(`/studio/${res.track.slug}`)
    }
  }
  return res
}

export async function deleteTrackAction(id: number) {
  const res = await studioService.deleteTrack(id)
  if (res.ok) {
    revalidatePath("/studio")
  }
  return res
}

export async function upsertLessonAction(
  trackId: number,
  title: string,
  lessonId?: number,
  position?: number,
  trackSlug?: string,
): Promise<
  { ok: true; lesson: AdminLessonSummary } | { ok: false; error: string }
> {
  if (!title.trim()) {
    return { ok: false, error: "Título da aula é obrigatório" }
  }

  const res = await studioService.upsertLesson(
    trackId,
    title.trim(),
    lessonId,
    position,
  )

  if (res.ok && trackSlug) {
    revalidatePath(`/studio/${trackSlug}`)
  }
  return res
}

export async function deleteLessonAction(id: number, trackSlug?: string) {
  const res = await studioService.deleteLesson(id)

  if (res.ok && trackSlug) {
    revalidatePath(`/studio/${trackSlug}`)
  }
  return res
}

export async function upsertSectionAction(
  lessonId: number,
  title: string,
  sectionId?: number,
  kind?: "TEXT" | "EXERCISE",
  contentMarkdown?: string,
  position?: number,
  trackSlug?: string,
  lessonSlug?: string,
  sectionSlug?: string,
): Promise<
  { ok: true; section: AdminSectionSummary } | { ok: false; error: string }
> {
  if (!title.trim()) {
    return { ok: false, error: "Título da seção é obrigatório" }
  }

  const res = await studioService.upsertSection(
    lessonId,
    title.trim(),
    sectionId,
    position,
    kind,
    contentMarkdown,
  )

  if (res.ok) {
    if (trackSlug) {
      revalidatePath(`/studio/${trackSlug}`)
      if (lessonSlug && sectionSlug) {
        revalidatePath(
          `/studio/${trackSlug}/lessons/${lessonSlug}/sections/${sectionSlug}/edit`,
        )
      }
    }
  }
  return res
}

export async function deleteSectionAction(id: number, trackSlug?: string) {
  const res = await studioService.deleteSection(id)

  if (res.ok && trackSlug) {
    revalidatePath(`/studio/${trackSlug}`)
  }
  return res
}
