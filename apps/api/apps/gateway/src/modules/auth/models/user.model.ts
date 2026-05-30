import { Field, ID, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class User {
  @Field(() => ID)
  code!: string

  @Field()
  email!: string

  @Field()
  name!: string

  @Field(() => String, { nullable: true })
  avatarUrl!: string | null
}
