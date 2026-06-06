import { Field, InputType } from "@nestjs/graphql"
import { z } from "zod"

export const upsertOAuthSchema = z.object({
  provider: z.enum(["google", "github"], { error: "Provedor inválido" }),
  providerAccountId: z.string().min(1, "providerAccountId obrigatório"),
  email: z.email("Email inválido"),
  name: z.string().trim().min(1, "Nome obrigatório"),
  avatarUrl: z.string().nullish(),
})

@InputType()
export class UpsertOAuthInput {
  @Field()
  provider!: string

  @Field()
  providerAccountId!: string

  @Field()
  email!: string

  @Field()
  name!: string

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null
}
