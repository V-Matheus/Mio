import { getTracks } from "@/lib/catalog/service"
import type { TrackSummary } from "@/lib/catalog/types"

export async function getTracksQuery(): Promise<TrackSummary[]> {
  return getTracks()
}
