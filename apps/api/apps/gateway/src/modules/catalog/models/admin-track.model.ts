import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { SectionKind } from "./section-kind.enum"

@ObjectType()
export class AdminSectionSummary {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => Int)
  position!: number

  @Field(() => SectionKind)
  kind!: SectionKind

  @Field()
  contentMarkdown!: string
}

@ObjectType()
export class AdminLessonSummary {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => Int)
  position!: number

  @Field(() => [AdminSectionSummary])
  sections!: AdminSectionSummary[]
}

@ObjectType()
export class AdminTrack {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string

  @Field()
  creatorCode!: string

  @Field(() => Int)
  lessonCount!: number
}

@ObjectType()
export class AdminTrackDetail {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string

  @Field()
  creatorCode!: string

  @Field(() => [AdminLessonSummary])
  lessons!: AdminLessonSummary[]
}
