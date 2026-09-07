"use server"

import { getMyAchievementsQuery } from "@/modules/achievements/queries"
import type { UserAchievementsPage } from "@/modules/achievements/types"

/**
 * Busca a próxima página de conquistas do usuário logado para o scroll
 * infinito do modal (`AchievementsSection`). Roda como Server Action porque a
 * leitura via Gateway exige sessão do NextAuth, indisponível no client.
 */
export async function loadMoreAchievementsAction(
  limit: number,
  offset: number,
): Promise<UserAchievementsPage> {
  return getMyAchievementsQuery(limit, offset)
}
