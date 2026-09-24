"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { resetPasswordAction } from "@/modules/auth/actions"
import { ButtonText, ButtonWrapper } from "@/shared/components/button"
import { Icon } from "@/shared/components/icon"
import {
  InputAdornment,
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/shared/components/input"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [state, action, pending] = useActionState(resetPasswordAction, {
    ok: false,
  })

  return (
    <section className="flex items-center justify-center px-6 py-12 lg:px-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Redefina sua senha
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Digite sua nova senha abaixo para recuperar o acesso à sua conta.
          </p>
        </header>

        {state.ok ? (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-success/10 p-4 text-sm font-medium text-success">
              {state.message ?? "Senha redefinida com sucesso!"}
            </div>

            <Link href="/login">
              <ButtonWrapper type="button" className="w-full">
                <ButtonText>Ir para o login</ButtonText>
              </ButtonWrapper>
            </Link>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-5" noValidate>
            <input type="hidden" name="token" value={token} />

            <InputWrapper>
              <InputLabel htmlFor="password">Nova senha</InputLabel>
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
              <InputLabel htmlFor="confirmPassword">
                Confirmar nova senha
              </InputLabel>
              <InputField>
                <InputControl
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  defaultValue={state.values?.confirmPassword ?? ""}
                />
                <InputAdornment
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
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

            {state.message && (
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
                {pending ? "Redefinindo..." : "Redefinir senha"}
              </ButtonText>
            </ButtonWrapper>
          </form>
        )}

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
