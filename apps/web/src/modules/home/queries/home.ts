import "server-only"

import { getHomeData } from "@/modules/home/services"
import type { HomeData } from "@/modules/home/types"

export async function getHomeQuery(): Promise<HomeData | null> {
  return await getHomeData()
}
