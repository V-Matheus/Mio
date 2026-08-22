import { notFound } from "next/navigation"
import { TrackPath } from "@/modules/catalog/components/track-path"
import { getTrackQuery } from "@/modules/catalog/queries/get-track"

interface TrackDetailViewProps {
  slug: string
  enroll?: string
}

export async function TrackDetailView({ slug, enroll }: TrackDetailViewProps) {
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
        autoOpenEnrollModal={enroll === "true"}
      />
    </div>
  )
}
