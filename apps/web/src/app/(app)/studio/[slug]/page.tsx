import { StudioTrackDetailView } from "@/modules/studio"

interface TrackDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TrackDetailPage({
  params,
}: TrackDetailPageProps) {
  const { slug } = await params

  return <StudioTrackDetailView slug={slug} />
}
