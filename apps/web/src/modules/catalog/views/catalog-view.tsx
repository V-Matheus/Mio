import { TrilhasClient } from "@/modules/catalog/components/trilhas-client"
import { getCategoriesQuery, getTracksQuery } from "@/modules/catalog/queries"

export async function CatalogView() {
  const [tracks, categories] = await Promise.all([
    getTracksQuery(),
    getCategoriesQuery(),
  ])

  return <TrilhasClient initialTracks={tracks} categories={categories} />
}
