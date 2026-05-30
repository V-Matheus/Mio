import { Field, InputType } from "@nestjs/graphql"
import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})

@InputType()
export class LoginInput {
  @Field()
  email!: string

  @Field()
  password!: string
}
