"use server"

import { redirect } from "next/navigation"
import { AuthError, type Session } from "next-auth"
import { z } from "zod"
import { auth, signIn } from "@/auth"
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
interface LoginActionResponse extends FormState {
  section: Session | null
}

export async function signInWithProvider(formData: FormData) {
  const session = await auth()
  if (session) {
    redirect("/home")
  }

  const provider = formData.get("provider")

  if (typeof provider !== "string") {
    return
  }

  await signIn(provider, { redirectTo: "/home" })
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<LoginActionResponse> {
  const session = await auth()
  if (session) {
    redirect("/home")
  }

  const values = Object.fromEntries(formData) as Record<string, string>
  const parsed = loginSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
      section: null,
    }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/home",
    })

    return { ok: true, section: null }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        message: "Email ou senha inválidos",
        values,
        section: null,
      }
    }

    throw error
  }
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth()
  if (session) {
    redirect("/home")
  }

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

  // Cadastro criou o usuário; agora autentica com as mesmas credenciais para
  // estabelecer a sessão NextAuth antes de ir para /home (senão o proxy vê
  // "anônimo" e devolve para /login).
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/home",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        message:
          "Conta criada, mas não foi possível entrar. Tente fazer login.",
        values,
      }
    }

    throw error
  }

  return { ok: true }
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth()
  if (session) {
    redirect("/home")
  }

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

export async function updateUserRoleAction(
  userCode: string,
  role: string,
): Promise<{ ok: boolean; error?: string }> {
  const result = await authService.updateUserRole(userCode, role)

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  return { ok: true }
}
