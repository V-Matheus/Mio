import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { render } from "@react-email/render"
import React from "react"
import { EmailService } from "../email/email.service"
import { PasswordResetEmail } from "../email/templates/password-reset.email"

export type UserPasswordResetRequestedPayload = {
  userCode: string
  email: string
  resetToken: string
  expiresAt: string
}

@Injectable()
export class PasswordResetConsumer extends AmqpConsumerService<UserPasswordResetRequestedPayload> {
  constructor(private readonly emailService: EmailService) {
    super({
      queue: "notifications.user.password_reset_requested",
      routingKey: "user.password_reset_requested",
      exchange: "mio.events",
      deadLetterExchange: "mio.events.dead",
      deadLetterQueue: "notifications.user.password_reset_requested.dead",
      maxRetries: 3,
    })
  }

  async handleMessage(
    payload: UserPasswordResetRequestedPayload,
  ): Promise<void> {
    this.logger.log(
      `[user.password_reset_requested] Recebido evento para ${payload.email}`,
    )

    const appUrl = process.env.APP_URL || "http://localhost:3000"

    const html = await render(
      React.createElement(PasswordResetEmail, {
        resetToken: payload.resetToken,
        appUrl,
        expiresAt: payload.expiresAt,
      }),
    )
    const text = await render(
      React.createElement(PasswordResetEmail, {
        resetToken: payload.resetToken,
        appUrl,
        expiresAt: payload.expiresAt,
      }),
      { plainText: true },
    )

    await this.emailService.enqueue({
      to: payload.email,
      subject: "Redefinição de Senha - Mio",
      html,
      text,
      template: "password-reset",
    })

    this.logger.log(
      `[user.password_reset_requested] Job de e-mail de redefinição de senha enfileirado para ${payload.email}`,
    )
  }
}
