import { Field, ID, InputType, Int } from "@nestjs/graphql"
import { SectionKind } from "../models/section-kind.enum"

@InputType()
export class CreateTrackInput {
  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string
}

@InputType()
export class UpdateTrackInput {
  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string
}

@InputType()
export class UpsertLessonInput {
  @Field(() => ID)
  trackSlug!: string

  @Field(() => ID, { nullable: true })
  slug?: string

  @Field()
  title!: string

  @Field(() => Int, { nullable: true })
  position?: number
}

@InputType()
export class UpsertSectionInput {
  @Field(() => ID)
  trackSlug!: string

  @Field(() => ID)
  lessonSlug!: string

  @Field(() => ID, { nullable: true })
  slug?: string

  @Field()
  title!: string

  @Field(() => Int, { nullable: true })
  position?: number

  @Field(() => SectionKind, { nullable: true })
  kind?: SectionKind

  @Field({ nullable: true })
  contentMarkdown?: string
}
