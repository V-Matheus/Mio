"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { signIn } from "@/auth"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/auth/schemas"
import { authService } from "@/lib/auth/service"

type FormState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string[] | undefined>
  values?: Record<string, string>
}

export async function signInWithProvider(formData: FormData) {
  const provider = formData.get("provider")

  if (typeof provider !== "string") {
    return
  }

  await signIn(provider, { redirectTo: "/home" })
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = Object.fromEntries(formData) as Record<string, string>
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const result = await authService.login(parsed.data)

  if (!result.ok) {
    return { ok: false, message: result.error, values }
  }

  redirect("/home")
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = Object.fromEntries(formData) as Record<string, string>
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const result = await authService.register(parsed.data)

  if (!result.ok) {
    return { ok: false, message: result.error, values }
  }

  redirect("/home")
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = Object.fromEntries(formData) as Record<string, string>
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const result = await authService.requestPasswordReset(parsed.data)

  if (!result.ok) {
    return { ok: false, message: result.error, values }
  }

  return {
    ok: true,
    message:
      "Se o email estiver cadastrado, você receberá um link de recuperação em instantes.",
  }
}
