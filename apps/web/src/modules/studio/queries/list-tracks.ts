import { studioService } from "@/modules/studio/services"
import type { AdminTrack } from "@/modules/studio/types"

export async function listStudioTracksQuery(
  accessToken?: string,
): Promise<{ ok: true; tracks: AdminTrack[] } | { ok: false; error: string }> {
  const tracks = await studioService.listTracks(accessToken)
  return { ok: true, tracks }
}
