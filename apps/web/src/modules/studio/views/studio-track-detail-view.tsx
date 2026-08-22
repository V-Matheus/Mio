import { notFound } from "next/navigation"
import { TrackDetailClient } from "@/modules/studio/components/track-detail-client"
import { getStudioTrackQuery } from "@/modules/studio/queries/get-track"

interface StudioTrackDetailViewProps {
  slug: string
}

export async function StudioTrackDetailView({
  slug,
}: StudioTrackDetailViewProps) {
  const result = await getStudioTrackQuery(slug)
  if (!result.ok || !result.track) {
    notFound()
  }

  return <TrackDetailClient track={result.track} />
}
