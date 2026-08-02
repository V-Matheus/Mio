import { UseGuards } from "@nestjs/common"
import { Args, ID, Int, Mutation, Query, Resolver } from "@nestjs/graphql"
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
import {
  AdminLessonSummary,
  AdminSectionSummary,
  AdminTrack,
  AdminTrackDetail,
} from "./models/admin-track.model"

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
    @Args("id", { type: () => Int })
    id: number,
    @Args("input") input: UpdateTrackInput,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<AdminTrack> {
    return this.catalogAdmin.updateTrack(id, input, userCode, role)
  }

  @Mutation(() => Boolean)
  deleteTrack(
    @Args("id", { type: () => Int })
    id: number,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin.deleteTrack(id, userCode, role)
  }

  @Mutation(() => AdminLessonSummary)
  upsertLesson(
    @Args("input") input: UpsertLessonInput,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<AdminLessonSummary> {
    return this.catalogAdmin.upsertLesson(input, userCode, role)
  }

  @Mutation(() => Boolean)
  deleteLesson(
    @Args("id", { type: () => Int })
    id: number,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin.deleteLesson(id, userCode, role)
  }

  @Mutation(() => AdminSectionSummary)
  upsertSection(
    @Args("input") input: UpsertSectionInput,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<AdminSectionSummary> {
    return this.catalogAdmin.upsertSection(input, userCode, role)
  }

  @Mutation(() => Boolean)
  deleteSection(
    @Args("id", { type: () => Int })
    id: number,
    @CurrentUserCode() userCode: string,
    @CurrentUserPrimaryRole() role: string,
  ): Promise<boolean> {
    return this.catalogAdmin.deleteSection(id, userCode, role)
  }
}
