import { UseGuards } from "@nestjs/common"
import { Args, Int, Query, Resolver } from "@nestjs/graphql"
import { CurrentUserCode, GqlAuthGuard } from "../auth/guards/gql-auth.guard"
import { GamificationGatewayService } from "./gamification.service"
import { LeaderboardEntry, UserXp } from "./gamification.types"

@Resolver()
export class GamificationResolver {
  constructor(
    private readonly gamificationService: GamificationGatewayService,
  ) {}

  @Query(() => UserXp, {
    description:
      "Consulta informações de XP, nível e ranking do usuário logado",
  })
  @UseGuards(GqlAuthGuard)
  myXp(@CurrentUserCode() userCode: string): Promise<UserXp> {
    return this.gamificationService.getUserXp(userCode)
  }

  @Query(() => [LeaderboardEntry], {
    description: "Consulta o ranking global de alunos paginado",
  })
  leaderboard(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 50 })
    limit: number,
    @Args("offset", { type: () => Int, nullable: true, defaultValue: 0 })
    offset: number,
  ): Promise<LeaderboardEntry[]> {
    return this.gamificationService.getLeaderboard(limit, offset)
  }
}
