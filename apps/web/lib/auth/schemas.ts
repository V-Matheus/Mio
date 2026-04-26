import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.email("Email inválido"),
    password: z
      .string()
      .min(8, "A senha precisa ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Inclua ao menos um número"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    terms: z.literal("on", { error: "Você precisa aceitar os termos" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.email("Email inválido"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
