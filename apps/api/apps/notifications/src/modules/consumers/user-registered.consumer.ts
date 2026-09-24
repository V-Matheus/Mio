import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { render } from "@react-email/render"
import React from "react"
import { EmailService } from "../email/email.service"
import { WelcomeEmail } from "../email/templates/welcome.email"

export type UserRegisteredPayload = {
  userCode: string
  email: string
  name: string
  registeredAt: string
}

@Injectable()
export class UserRegisteredConsumer extends AmqpConsumerService<UserRegisteredPayload> {
  constructor(private readonly emailService: EmailService) {
    super({
      queue: "notifications.user.registered",
      routingKey: "user.registered",
      exchange: "mio.events",
      deadLetterExchange: "mio.events.dead",
      deadLetterQueue: "notifications.user.registered.dead",
      maxRetries: 3,
    })
  }

  async handleMessage(payload: UserRegisteredPayload): Promise<void> {
    this.logger.log(
      `[user.registered] Recebido evento para usuário ${payload.name} <${payload.email}>`,
    )

    const appUrl = process.env.APP_URL || "http://localhost:3000"

    const html = await render(
      React.createElement(WelcomeEmail, { name: payload.name, appUrl }),
    )
    const text = await render(
      React.createElement(WelcomeEmail, { name: payload.name, appUrl }),
      { plainText: true },
    )

    await this.emailService.enqueue({
      to: payload.email,
      subject: "Bem-vindo ao Mio!",
      html,
      text,
      template: "welcome",
    })

    this.logger.log(
      `[user.registered] Job de e-mail de boas-vindas enfileirado para ${payload.email}`,
    )
  }
}
