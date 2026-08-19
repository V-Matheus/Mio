import { UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { CurrentUserCode, GqlAuthGuard } from "../auth/guards/gql-auth.guard"
import { ProfileService } from "./profile.service"
import { UserProfile } from "./profile.types"

@Resolver(() => UserProfile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => UserProfile, {
    description:
      "Consulta o perfil consolidado do aluno (próprio ou por userCode)",
  })
  @UseGuards(GqlAuthGuard)
  profile(
    @Args({ name: "userCode", type: () => ID, nullable: true })
    userCode?: string,
    @CurrentUserCode() currentUserCode?: string,
  ): Promise<UserProfile> {
    const targetCode = userCode?.trim() || currentUserCode || ""
    return this.profileService.getProfile(targetCode)
  }
}
