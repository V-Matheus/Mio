import { UseGuards } from "@nestjs/common"
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql"
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe"
import { Roles } from "../auth/decorators/roles.decorator"
import { CurrentUserCode } from "../auth/guards/gql-auth.guard"
import {
  CurrentUserPrimaryRole,
  PermissionsGuard,
} from "../auth/guards/permissions.guard"
import { CatalogAdminGatewayService } from "./catalog-admin.service"
import {
  CreateTrackInput,
  UpdateTrackInput,
  UpsertLessonInput,
  UpsertSectionInput,
} from "./dto/admin-track.dto"
import { slugSchema } from "./dto/slug.schema"
import { AdminTrack, AdminTrackDetail } from "./models/admin-track.model"

@Resolver(() => AdminTrack)
@UseGuards(PermissionsGuard)
@Roles("TEACHER", "ADMIN")
export class CatalogAdminResolver {
  constructor(private readonly catalogAdmin: CatalogAdminGatewayService) {}

  @Query(() => [AdminTrack])
  adminTracks(
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<AdminTrack[]> {
    return this.catalogAdmin.adminTracks(userCode, role)
  }

  @Query(() => AdminTrackDetail, { nullable: true })
  adminTrack(
    @Args("slug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    slug: string,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<AdminTrackDetail | null> {
    return this.catalogAdmin.adminTrack(slug, userCode, role)
  }

  @Mutation(() => AdminTrack)
  createTrack(
    @Args("input") input: CreateTrackInput,
    @CurrentUserCode() userCode: string,
  ): Promise<AdminTrack> {
    return this.catalogAdmin.createTrack(input, userCode)
  }

  @Mutation(() => AdminTrack)
  updateTrack(
    @Args("slug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    slug: string,
    @Args("input") input: UpdateTrackInput,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<AdminTrack> {
    return this.catalogAdmin.updateTrack(slug, input, userCode, role)
  }

  @Mutation(() => Boolean)
  deleteTrack(
    @Args("slug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    slug: string,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin.deleteTrack(slug, userCode, role)
  }

  @Mutation(() => Boolean)
  upsertLesson(
    @Args("input") input: UpsertLessonInput,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin
      .upsertLesson(input, userCode, role)
      .then(() => true)
  }

  @Mutation(() => Boolean)
  deleteLesson(
    @Args("trackSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    trackSlug: string,
    @Args("lessonSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    lessonSlug: string,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin.deleteLesson(trackSlug, lessonSlug, userCode, role)
  }

  @Mutation(() => Boolean)
  upsertSection(
    @Args("input") input: UpsertSectionInput,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin
      .upsertSection(input, userCode, role)
      .then(() => true)
  }

  @Mutation(() => Boolean)
  deleteSection(
    @Args("trackSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    trackSlug: string,
    @Args("lessonSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    lessonSlug: string,
    @Args("sectionSlug", { type: () => ID }, new ZodValidationPipe(slugSchema))
    sectionSlug: string,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin.deleteSection(
      trackSlug,
      lessonSlug,
      sectionSlug,
      userCode,
      role,
    )
  }
}
