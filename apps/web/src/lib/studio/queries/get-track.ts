import { studioService } from "@/lib/studio/service"
import type { AdminTrackDetail } from "@/lib/studio/types"

export async function getStudioTrackQuery(
  slug: string,
  accessToken?: string,
): Promise<
  { ok: true; track: AdminTrackDetail | null } | { ok: false; error: string }
> {
  const track = await studioService.getTrack(slug, accessToken)
  return { ok: true, track }
}
