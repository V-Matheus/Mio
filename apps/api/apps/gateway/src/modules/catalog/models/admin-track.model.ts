import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Category } from "./category.model"
import { SectionKind } from "./section-kind.enum"

@ObjectType()
export class AdminSectionSummary {
  @Field(() => Int)
  id!: number

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
  @Field(() => Int)
  id!: number

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
  @Field(() => Int)
  id!: number

  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Category, { nullable: true })
  category?: Category

  @Field()
  creatorCode!: string

  @Field(() => Int)
  lessonCount!: number
}

@ObjectType()
export class AdminTrackDetail {
  @Field(() => Int)
  id!: number

  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Category, { nullable: true })
  category?: Category

  @Field()
  creatorCode!: string

  @Field(() => [AdminLessonSummary])
  lessons!: AdminLessonSummary[]
}
