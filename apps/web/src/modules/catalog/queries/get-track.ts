import { getTrack } from "@/modules/catalog/services"
import type { TrackDetail } from "@/modules/catalog/types"

export async function getTrackQuery(slug: string): Promise<TrackDetail | null> {
  return getTrack(slug)
}
