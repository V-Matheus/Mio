import { Field, ID, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class Category {
  @Field(() => ID)
  id!: string

  @Field(() => ID)
  slug!: string

  @Field()
  name!: string

  @Field()
  color!: string
}
