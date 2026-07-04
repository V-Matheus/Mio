import { Field, ID, Int, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class Track {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => String, { nullable: true })
  description!: string | null

  @Field(() => Int)
  lessonCount!: number

  @Field()
  enrolled!: boolean
}
