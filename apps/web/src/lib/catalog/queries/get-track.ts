import { getTrack } from "@/lib/catalog/service"
import type { TrackDetail } from "@/lib/catalog/types"

export async function getTrackQuery(slug: string): Promise<TrackDetail | null> {
  return getTrack(slug)
}
