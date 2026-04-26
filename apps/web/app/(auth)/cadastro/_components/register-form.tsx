"use client"

import { Icon } from "@iconify/react"
import Link from "next/link"
import { useActionState, useState } from "react"
import { registerAction } from "@/app/(auth)/_actions/auth"
import { SocialLogin } from "@/app/(auth)/_components/social-login"
import { ButtonText, ButtonWrapper } from "@/app/components/button"
import {
  InputAdornment,
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/app/components/input"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [state, action, pending] = useActionState(registerAction, {
    ok: false,
  })

  return (
    <section className="flex items-center justify-center px-6 py-12 lg:px-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Crie sua conta!
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Preencha os dados para começar sua jornada
          </p>
        </header>

        <form action={action} className="flex flex-col gap-5" noValidate>
          <InputWrapper>
            <InputLabel htmlFor="name">Nome completo</InputLabel>
            <InputField>
              <InputControl
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                defaultValue={state.values?.name ?? ""}
              />
            </InputField>
            {state.fieldErrors?.name?.[0] && (
              <span className="text-xs font-medium text-red-600">
                {state.fieldErrors.name[0]}
              </span>
            )}
          </InputWrapper>

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

          <InputWrapper>
            <InputLabel htmlFor="password">Senha</InputLabel>
            <InputField>
              <InputControl
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                defaultValue={state.values?.password ?? ""}
              />
              <InputAdornment
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((value) => !value)}
              >
                <Icon
                  icon={
                    showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"
                  }
                  width={20}
                  height={20}
                />
              </InputAdornment>
            </InputField>
            {state.fieldErrors?.password?.[0] && (
              <span className="text-xs font-medium text-red-600">
                {state.fieldErrors.password[0]}
              </span>
            )}
          </InputWrapper>

          <InputWrapper>
            <InputLabel htmlFor="confirm-password">Confirmar senha</InputLabel>
            <InputField>
              <InputControl
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                defaultValue={state.values?.confirmPassword ?? ""}
              />
              <InputAdornment
                aria-label={
                  showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                }
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                <Icon
                  icon={
                    showConfirmPassword
                      ? "mdi:eye-off-outline"
                      : "mdi:eye-outline"
                  }
                  width={20}
                  height={20}
                />
              </InputAdornment>
            </InputField>
            {state.fieldErrors?.confirmPassword?.[0] && (
              <span className="text-xs font-medium text-red-600">
                {state.fieldErrors.confirmPassword[0]}
              </span>
            )}
          </InputWrapper>

          <div className="flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-start gap-3 text-xs text-foreground/60">
              <input
                type="checkbox"
                name="terms"
                defaultChecked={state.values?.terms === "on"}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-foreground/20 bg-white shadow-[0_2px_0_rgba(51,45,40,0.08)] transition-all duration-200 peer-hover:-translate-y-0.5 peer-hover:border-primary/40 peer-hover:shadow-[0_3px_0_rgba(51,45,40,0.1)] peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-[0_2px_0_var(--color-primary-shadow)] peer-checked:[&_svg]:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2"
              >
                <Icon
                  icon="mdi:check-bold"
                  width={14}
                  height={14}
                  className="text-white opacity-0 transition-opacity"
                />
              </span>
              <span>
                Concordo com os{" "}
                <Link
                  href="/termos"
                  className="font-semibold text-primary hover:underline"
                >
                  termos de uso
                </Link>{" "}
                e{" "}
                <Link
                  href="/privacidade"
                  className="font-semibold text-primary hover:underline"
                >
                  política de privacidade
                </Link>
                .
              </span>
            </label>
            {state.fieldErrors?.terms?.[0] && (
              <span className="text-xs font-medium text-red-600">
                {state.fieldErrors.terms[0]}
              </span>
            )}
          </div>

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
              {pending ? "Criando conta..." : "Cadastrar"}
            </ButtonText>
          </ButtonWrapper>
        </form>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-foreground/10" />
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            ou continue com
          </span>
          <span className="h-px flex-1 bg-foreground/10" />
        </div>

        <SocialLogin />

        <p className="text-center text-sm text-foreground/60">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </section>
  )
}
