import { TrackDetailView } from "@/modules/catalog"

interface TrackPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ enroll?: string }>
}

export default async function TrackDetailPage({
  params,
  searchParams,
}: TrackPageProps) {
  const { slug } = await params
  const { enroll } = await searchParams

  return <TrackDetailView slug={slug} enroll={enroll} />
}
