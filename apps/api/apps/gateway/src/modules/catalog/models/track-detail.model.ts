import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Category } from "./category.model"
import { LessonSummary } from "./lesson-summary.model"

@ObjectType()
export class TrackDetail {
  @Field(() => Int)
  id!: number

  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  description!: string | null

  @Field(() => Category, { nullable: true })
  category!: Category | null

  @Field(() => [LessonSummary])
  lessons!: LessonSummary[]

  @Field()
  enrolled!: boolean
}
