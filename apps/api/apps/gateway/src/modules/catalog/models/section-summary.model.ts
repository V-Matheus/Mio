import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { SectionKind } from "./section-kind.enum"

@ObjectType()
export class SectionSummary {
  @Field(() => Int)
  id!: number

  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => Int)
  position!: number

  @Field(() => SectionKind)
  kind!: SectionKind

  @Field()
  completed!: boolean
}
