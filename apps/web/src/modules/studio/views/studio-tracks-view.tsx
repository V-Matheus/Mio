import { getSessionUser } from "@/modules/auth/utils/getSessionUser"
import { getCategoriesQuery } from "@/modules/catalog/queries"
import { StudioTracksClient } from "@/modules/studio/components/studio-tracks-client"
import { listStudioTracksQuery } from "@/modules/studio/queries/list-tracks"

export async function StudioTracksView() {
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
