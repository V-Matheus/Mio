import { getCategoriesQuery, getTracksQuery } from "@/lib/catalog/queries"
import { TrilhasClient } from "./_components/trilhas-client"

export default async function TrilhasPage() {
  const [tracks, categories] = await Promise.all([
    getTracksQuery(),
    getCategoriesQuery(),
  ])

  return <TrilhasClient initialTracks={tracks} categories={categories} />
}
