import { notFound } from "next/navigation"
import { TrackPath } from "@/app/(app)/trilhas/_components/track-path"
import { getTrackQuery } from "@/lib/catalog/queries"

interface TrackPageProps {
  params: Promise<{ slug: string }>
}

export default async function TrackDetailPage({ params }: TrackPageProps) {
  const { slug } = await params
  const track = await getTrackQuery(slug)

  if (!track) {
    notFound()
  }

  return (
    <div className="w-full pt-4">
      <TrackPath
        trackId={track.id}
        trackSlug={track.slug}
        trackTitle={track.title}
        trackDescription={track.description}
        lessons={track.lessons}
        enrolled={track.enrolled}
      />
    </div>
  )
}
