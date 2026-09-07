import { UseGuards } from "@nestjs/common"
import { Args, Int, Query, Resolver } from "@nestjs/graphql"
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe"
import { CurrentUserCode, GqlAuthGuard } from "../auth/guards/gql-auth.guard"
import { AchievementsGatewayService } from "./achievements.service"
import { AchievementsPage, UserAchievementsPage } from "./achievements.types"
import {
  achievementsLimitSchema,
  achievementsOffsetSchema,
} from "./dto/achievements-pagination.schema"

@Resolver()
export class AchievementsResolver {
  constructor(
    private readonly achievementsService: AchievementsGatewayService,
  ) {}

  @Query(() => AchievementsPage, {
    description:
      "Lista, de forma paginada, todas as conquistas disponíveis na plataforma",
  })
  achievements(
    @Args(
      "limit",
      { type: () => Int, nullable: true, defaultValue: 10 },
      new ZodValidationPipe(achievementsLimitSchema),
    )
    limit: number,
    @Args(
      "offset",
      { type: () => Int, nullable: true, defaultValue: 0 },
      new ZodValidationPipe(achievementsOffsetSchema),
    )
    offset: number,
  ): Promise<AchievementsPage> {
    return this.achievementsService.listAchievements(limit, offset)
  }

  @Query(() => UserAchievementsPage, {
    description:
      "Lista, de forma paginada, as conquistas com o progresso do usuário logado",
  })
  @UseGuards(GqlAuthGuard)
  myAchievements(
    @CurrentUserCode() userCode: string,
    @Args(
      "limit",
      { type: () => Int, nullable: true, defaultValue: 10 },
      new ZodValidationPipe(achievementsLimitSchema),
    )
    limit: number,
    @Args(
      "offset",
      { type: () => Int, nullable: true, defaultValue: 0 },
      new ZodValidationPipe(achievementsOffsetSchema),
    )
    offset: number,
  ): Promise<UserAchievementsPage> {
    return this.achievementsService.getUserAchievements(userCode, limit, offset)
  }
}
