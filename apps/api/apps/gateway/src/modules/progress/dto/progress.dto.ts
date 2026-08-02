import { Field, Int, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class LessonProgress {
  @Field(() => Int, { nullable: true })
  lastSectionId?: number

  @Field(() => String, { nullable: true })
  completedAt?: string

  @Field(() => [Int])
  viewedSectionIds!: number[]
}

@ObjectType()
export class MarkSectionResult {
  @Field(() => Boolean)
  ok!: boolean

  @Field(() => Boolean)
  lessonCompleted!: boolean
}
