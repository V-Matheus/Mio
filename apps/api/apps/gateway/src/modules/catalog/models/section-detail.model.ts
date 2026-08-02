import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { SectionKind } from "./section-kind.enum"

@ObjectType()
export class SectionDetail {
  @Field(() => Int)
  id!: number

  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => SectionKind)
  kind!: SectionKind

  @Field()
  contentMarkdown!: string
}
