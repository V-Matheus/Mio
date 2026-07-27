import { getSessionUser } from "@/lib/auth/utils"
import { studioService } from "@/lib/studio/service"
import { StudioTracksClient } from "./_components/studio-tracks-client"

export default async function StudioTracksPage() {
  const user = await getSessionUser()

  const result = await studioService.listTracks()
  const initialTracks = result.ok ? result.tracks : []

  return (
    <StudioTracksClient initialTracks={initialTracks} userRoles={user.roles} />
  )
}
