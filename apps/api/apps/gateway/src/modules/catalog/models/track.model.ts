import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Category } from "./category.model"

@ObjectType()
export class Track {
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

  @Field(() => Int)
  lessonCount!: number

  @Field()
  enrolled!: boolean
}
