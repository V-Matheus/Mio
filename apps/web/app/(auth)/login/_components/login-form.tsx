"use client"

import { Icon } from "@iconify/react"
import Link from "next/link"
import { useActionState, useState } from "react"
import { loginAction } from "@/app/(auth)/_actions/auth"
import { SocialLogin } from "@/app/(auth)/_components/social-login"
import { ButtonText, ButtonWrapper } from "@/app/components/button"
import {
  InputAdornment,
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/app/components/input"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, action, pending] = useActionState(loginAction, { ok: false })

  return (
    <section className="flex items-center justify-center px-6 py-12 lg:px-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Bem-vindo de volta!
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Entre para continuar sua jornada
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
                placeholder="mio@email.com"
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
                autoComplete="current-password"
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
            <Link
              href="/recuperar-senha"
              className="self-end text-xs font-semibold text-primary hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </InputWrapper>

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
            <ButtonText>{pending ? "Entrando..." : "Entrar"}</ButtonText>
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
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-primary hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </section>
  )
}
