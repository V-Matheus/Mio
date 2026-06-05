/** Exchange topic compartilhado por todos os eventos de domínio (ver spec 00). */
export const EVENTS_EXCHANGE = "mio.events"

/** Versão do contrato de evento, enviada no header `x-event-version`. */
export const EVENT_VERSION = 1

/** Routing keys dos eventos publicados pelo módulo users. */
export const UserEventRoutingKey = {
  Registered: "user.registered",
  PasswordResetRequested: "user.password_reset_requested",
} as const

export type UserRegisteredPayload = {
  userCode: string
  email: string
  name: string
  registeredAt: string
}

export type UserPasswordResetRequestedPayload = {
  userCode: string
  email: string
  resetToken: string
  expiresAt: string
}
