import { Field, ID, ObjectType } from "@nestjs/graphql"
import { SectionSummary } from "./section-summary.model"

@ObjectType()
export class LessonDetail {
  @Field(() => ID)
  trackSlug!: string

  @Field(() => ID)
  lessonSlug!: string

  @Field()
  title!: string

  @Field(() => [SectionSummary])
  sections!: SectionSummary[]
}
