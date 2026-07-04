import { Field, ID, ObjectType } from "@nestjs/graphql"
import { SectionKind } from "./section-kind.enum"

@ObjectType()
export class SectionDetail {
  @Field(() => ID)
  slug!: string

  @Field()
  title!: string

  @Field(() => SectionKind)
  kind!: SectionKind

  @Field()
  contentMarkdown!: string
}
