import { getTracks } from "@/modules/catalog/services"
import type { TrackSummary } from "@/modules/catalog/types"

export async function getTracksQuery(): Promise<TrackSummary[]> {
  return getTracks()
}
