"use client"

import { Icon } from "@iconify/react"
import Link from "next/link"
import { useActionState } from "react"
import { forgotPasswordAction } from "@/app/(auth)/_actions/auth"
import { ButtonText, ButtonWrapper } from "@/app/components/button"
import {
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/app/components/input"

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {
    ok: false,
  })

  return (
    <section className="flex items-center justify-center px-6 py-12 lg:px-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Esqueceu sua senha?
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Sem problema! Digite seu email e enviaremos um link pra você criar
            uma nova senha.
          </p>
        </header>

        <form action={action} className="flex flex-col gap-5" noValidate>
          <InputWrapper>
            <InputLabel htmlFor="email">Email</InputLabel>
            <InputField>
              <InputControl
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                defaultValue={state.values?.email ?? ""}
              />
            </InputField>
            {state.fieldErrors?.email?.[0] && (
              <span className="text-xs font-medium text-red-600">
                {state.fieldErrors.email[0]}
              </span>
            )}
          </InputWrapper>

          {state.message && state.ok && (
            <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
              {state.message}
            </p>
          )}

          {state.message && !state.ok && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {state.message}
            </p>
          )}

          <ButtonWrapper
            type="submit"
            className="mt-2 w-full"
            disabled={pending}
          >
            <ButtonText>
              {pending ? "Enviando..." : "Enviar link de recuperação"}
            </ButtonText>
          </ButtonWrapper>
        </form>

        <p className="text-center text-sm text-foreground/60">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <Icon icon="mdi:arrow-left" width={16} height={16} />
            Voltar para o login
          </Link>
        </p>
      </div>
    </section>
  )
}
