import { redirect } from "next/navigation"

interface TrackAulaIndexProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TrackAulaIndexPage({
  params,
}: TrackAulaIndexProps) {
  const { slug } = await params
  redirect(`/trilhas/${slug}`)
}
