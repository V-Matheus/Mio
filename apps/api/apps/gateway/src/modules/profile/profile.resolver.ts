import { UseGuards } from "@nestjs/common"
import { Query, Resolver } from "@nestjs/graphql"
import { CurrentUserCode, GqlAuthGuard } from "../auth/guards/gql-auth.guard"
import { ProfileService } from "./profile.service"
import { UserProfile } from "./profile.types"

@Resolver(() => UserProfile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => UserProfile, {
    description: "Consulta o perfil consolidado do aluno autenticado",
  })
  @UseGuards(GqlAuthGuard)
  profile(@CurrentUserCode() currentUserCode: string): Promise<UserProfile> {
    return this.profileService.getProfile(currentUserCode)
  }
}
