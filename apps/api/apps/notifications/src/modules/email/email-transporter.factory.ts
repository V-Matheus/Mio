import { Logger } from "@nestjs/common"
import nodemailer, { type Transporter } from "nodemailer"

export const EMAIL_TRANSPORTER = "EMAIL_TRANSPORTER"

export const emailTransporterFactory = {
  provide: EMAIL_TRANSPORTER,
  useFactory: async (): Promise<Transporter> => {
    const logger = new Logger("EmailTransporter")

    const host = process.env.SMTP_HOST || "localhost"
    const port = Number.parseInt(process.env.SMTP_PORT || "1025", 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465

    logger.log(
      `Inicializando Transporter SMTP agnóstico [${host}:${port}] (secure: ${secure})`,
    )

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && pass
        ? {
            auth: {
              user,
              pass,
            },
          }
        : {}),
    })

    return transporter
  },
}
