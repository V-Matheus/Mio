import { Field, ObjectType } from "@nestjs/graphql"
import { User } from "./user.model"

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string

  @Field()
  refreshToken!: string

  @Field(() => User)
  user!: User
}
