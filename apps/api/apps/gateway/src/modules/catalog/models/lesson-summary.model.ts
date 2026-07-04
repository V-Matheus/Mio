import { Field, ID, Int, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class LessonSummary {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => Int)
  position!: number

  @Field()
  completed!: boolean
}
