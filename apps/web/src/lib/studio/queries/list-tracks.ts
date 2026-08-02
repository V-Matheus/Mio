import { studioService } from "@/lib/studio/service"
import type { AdminTrack } from "@/lib/studio/types"

export async function listStudioTracksQuery(
  accessToken?: string,
): Promise<{ ok: true; tracks: AdminTrack[] } | { ok: false; error: string }> {
  const tracks = await studioService.listTracks(accessToken)
  return { ok: true, tracks }
}
