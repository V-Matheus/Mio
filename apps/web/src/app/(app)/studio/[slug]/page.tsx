import { notFound } from "next/navigation"
import { studioService } from "@/lib/studio/service"
import { TrackDetailClient } from "./_components/track-detail-client"

interface TrackDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TrackDetailPage({
  params,
}: TrackDetailPageProps) {
  const { slug } = await params

  const result = await studioService.getTrack(slug)
  if (!result.ok || !result.track) {
    notFound()
  }

  return <TrackDetailClient track={result.track} />
}
