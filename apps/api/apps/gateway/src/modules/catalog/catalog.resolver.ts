import { UseGuards } from "@nestjs/common"
import { Args, ID, Int, Mutation, Query, Resolver } from "@nestjs/graphql"
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe"
import { CurrentUserCode, GqlAuthGuard } from "../auth/guards/gql-auth.guard"
import { OptionalGqlAuthGuard } from "../auth/guards/optional-gql-auth.guard"
import { CatalogService } from "./catalog.service"
import { slugSchema } from "./dto/slug.schema"
import { Category } from "./models/category.model"
import { LessonDetail } from "./models/lesson-detail.model"
import { SectionDetail } from "./models/section-detail.model"
import { Track } from "./models/track.model"
import { TrackDetail } from "./models/track-detail.model"

@Resolver(() => Track)
export class CatalogResolver {
  constructor(private readonly catalog: CatalogService) {}

  @Query(() => [Category])
  categories(): Promise<Category[]> {
    return this.catalog.categories()
  }

  @Query(() => [Track])
  @UseGuards(OptionalGqlAuthGuard)
  tracks(@CurrentUserCode() userCode?: string): Promise<Track[]> {
    return this.catalog.tracks(userCode)
  }

  @Query(() => TrackDetail, { nullable: true })
  @UseGuards(OptionalGqlAuthGuard)
  track(
    @Args("slug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    slug: string,
    @CurrentUserCode() userCode?: string,
  ): Promise<TrackDetail | null> {
    return this.catalog.track(slug, userCode)
  }

  @Query(() => LessonDetail, { nullable: true })
  @UseGuards(OptionalGqlAuthGuard)
  lesson(
    @Args("trackSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    trackSlug: string,
    @Args("lessonSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    lessonSlug: string,
    @CurrentUserCode() userCode?: string,
  ): Promise<LessonDetail | null> {
    return this.catalog.lesson(trackSlug, lessonSlug, userCode)
  }

  @Query(() => SectionDetail, { nullable: true })
  @UseGuards(OptionalGqlAuthGuard)
  section(
    @Args("trackSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    trackSlug: string,
    @Args("lessonSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    lessonSlug: string,
    @Args("sectionSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    sectionSlug: string,
    @CurrentUserCode() userCode?: string,
  ): Promise<SectionDetail | null> {
    return this.catalog.section(trackSlug, lessonSlug, sectionSlug, userCode)
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  enrollInTrack(
    @Args("trackId", { type: () => Int })
    trackId: number,
    @CurrentUserCode() userCode: string,
  ): Promise<boolean> {
    return this.catalog.enrollInTrack(userCode, trackId)
  }
}
