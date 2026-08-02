import { getSessionUser } from "@/lib/auth/utils"
import { getCategoriesQuery } from "@/lib/catalog/queries"
import { listStudioTracksQuery } from "@/lib/studio/queries"
import { StudioTracksClient } from "./_components/studio-tracks-client"

export default async function StudioTracksPage() {
  const user = await getSessionUser()

  const [tracksResult, categories] = await Promise.all([
    listStudioTracksQuery(),
    getCategoriesQuery(),
  ])
  const initialTracks = tracksResult.ok ? tracksResult.tracks : []

  return (
    <StudioTracksClient
      initialTracks={initialTracks}
      categories={categories}
      userRoles={user.roles}
    />
  )
}
