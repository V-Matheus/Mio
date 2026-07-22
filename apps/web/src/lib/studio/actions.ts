"use server"

import { revalidatePath } from "next/cache"
import { studioService } from "./service"

export async function createTrackAction(formData: FormData) {
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || undefined

  if (!title?.trim()) {
    return { ok: false, error: "Título é obrigatório" }
  }

  const res = await studioService.createTrack(title.trim(), description?.trim())

  if (res.ok) {
    revalidatePath("/studio")
  }
  return res
}

export async function updateTrackAction(slug: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || undefined

  if (!title?.trim()) {
    return { ok: false, error: "Título é obrigatório" }
  }

  const res = await studioService.updateTrack(
    slug,
    title.trim(),
    description?.trim(),
  )

  if (res.ok) {
    revalidatePath("/studio")
    revalidatePath(`/studio/${slug}`)
  }
  return res
}

export async function deleteTrackAction(slug: string) {
  const res = await studioService.deleteTrack(slug)
  if (res.ok) {
    revalidatePath("/studio")
  }
  return res
}

export async function upsertLessonAction(
  trackSlug: string,
  lessonSlug: string | undefined,
  title: string,
  position?: number,
) {
  if (!title.trim()) {
    return { ok: false, error: "Título da aula é obrigatório" }
  }

  const res = await studioService.upsertLesson(
    trackSlug,
    title.trim(),
    lessonSlug,
    position,
  )

  if (res.ok) {
    revalidatePath(`/studio/${trackSlug}`)
  }
  return res
}

export async function deleteLessonAction(
  trackSlug: string,
  lessonSlug: string,
) {
  const res = await studioService.deleteLesson(trackSlug, lessonSlug)

  if (res.ok) {
    revalidatePath(`/studio/${trackSlug}`)
  }
  return res
}

export async function upsertSectionAction(
  trackSlug: string,
  lessonSlug: string,
  sectionSlug: string | undefined,
  title: string,
  kind?: "TEXT" | "EXERCISE",
  contentMarkdown?: string,
  position?: number,
) {
  if (!title.trim()) {
    return { ok: false, error: "Título da seção é obrigatório" }
  }

  const res = await studioService.upsertSection(
    trackSlug,
    lessonSlug,
    title.trim(),
    sectionSlug,
    position,
    kind,
    contentMarkdown,
  )

  if (res.ok) {
    revalidatePath(`/studio/${trackSlug}`)
    if (sectionSlug) {
      revalidatePath(
        `/studio/${trackSlug}/lessons/${lessonSlug}/sections/${sectionSlug}/edit`,
      )
    }
  }
  return res
}

export async function deleteSectionAction(
  trackSlug: string,
  lessonSlug: string,
  sectionSlug: string,
) {
  const res = await studioService.deleteSection(
    trackSlug,
    lessonSlug,
    sectionSlug,
  )

  if (res.ok) {
    revalidatePath(`/studio/${trackSlug}`)
  }
  return res
}
