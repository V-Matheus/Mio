"use server"

import { revalidatePath } from "next/cache"
import { enrollInTrack, getSection } from "@/lib/catalog/service"
import type { SectionDetail } from "@/lib/catalog/types"

export async function enrollInTrackAction(
  trackId: number,
  trackSlug?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await enrollInTrack(trackId)
  if (result.ok) {
    revalidatePath("/trilhas")
    if (trackSlug) {
      revalidatePath(`/trilhas/${trackSlug}`)
    }
  }
  return result
}

export async function getSectionAction(
  trackSlug: string,
  lessonSlug: string,
  sectionSlug: string,
): Promise<SectionDetail | null> {
  return getSection(trackSlug, lessonSlug, sectionSlug)
}
