"use server"

import { revalidatePath } from "next/cache"
import { enrollInTrack } from "@/lib/catalog/service"

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
