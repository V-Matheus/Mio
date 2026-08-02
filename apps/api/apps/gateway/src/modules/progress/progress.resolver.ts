import { UseGuards } from "@nestjs/common"
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql"
import { CurrentUserCode, GqlAuthGuard } from "../auth/guards/gql-auth.guard"
import { LessonProgress, MarkSectionResult } from "./dto/progress.dto"
import { ProgressGatewayService } from "./progress.service"

@Resolver()
export class ProgressResolver {
  constructor(private readonly progressService: ProgressGatewayService) {}

  @Query(() => LessonProgress)
  @UseGuards(GqlAuthGuard)
  lessonProgress(
    @Args("lessonId", { type: () => Int })
    lessonId: number,
    @CurrentUserCode() userCode: string,
  ): Promise<LessonProgress> {
    return this.progressService.getLessonProgress(userCode, lessonId)
  }

  @Mutation(() => MarkSectionResult)
  @UseGuards(GqlAuthGuard)
  markSectionViewed(
    @Args("sectionId", { type: () => Int })
    sectionId: number,
    @CurrentUserCode() userCode: string,
  ): Promise<MarkSectionResult> {
    return this.progressService.markSectionViewed(userCode, sectionId)
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  markLessonCompleted(
    @Args("lessonId", { type: () => Int })
    lessonId: number,
    @CurrentUserCode() userCode: string,
  ): Promise<boolean> {
    return this.progressService.markLessonCompleted(userCode, lessonId)
  }
}
