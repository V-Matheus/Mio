import { Field, InputType, Int } from "@nestjs/graphql"
import { SectionKind } from "../models/section-kind.enum"

@InputType()
export class CreateTrackInput {
  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  categoryId?: string
}

@InputType()
export class UpdateTrackInput {
  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  categoryId?: string
}

@InputType()
export class UpsertLessonInput {
  @Field(() => Int)
  trackId!: number

  @Field(() => Int, { nullable: true })
  id?: number

  @Field()
  title!: string

  @Field(() => Int, { nullable: true })
  position?: number
}

@InputType()
export class UpsertSectionInput {
  @Field(() => Int)
  lessonId!: number

  @Field(() => Int, { nullable: true })
  id?: number

  @Field()
  title!: string

  @Field(() => Int, { nullable: true })
  position?: number

  @Field(() => SectionKind, { nullable: true })
  kind?: SectionKind

  @Field(() => String, { nullable: true })
  contentMarkdown?: string
}
