import { Field, ID, ObjectType } from "@nestjs/graphql"
import { LessonSummary } from "./lesson-summary.model"

@ObjectType()
export class TrackDetail {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  description!: string | null

  @Field(() => [LessonSummary])
  lessons!: LessonSummary[]

  @Field()
  enrolled!: boolean
}
