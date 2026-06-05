import { Field, InputType } from "@nestjs/graphql"
import { z } from "zod"

export const registerSchema = z.object({
  email: z.email("Email inválido"),
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(80, "Nome muito longo"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
})

@InputType()
export class RegisterInput {
  @Field()
  email!: string

  @Field()
  name!: string

  @Field()
  password!: string
}
