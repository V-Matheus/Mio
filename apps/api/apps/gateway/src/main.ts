import { NestFactory } from "@nestjs/core"
import { GatewayModule } from "./gateway.module"

async function bootstrap() {
  const internalSecret = process.env.INTERNAL_API_SECRET
  if (!internalSecret || internalSecret.trim() === "") {
    throw new Error(
      "FATAL: INTERNAL_API_SECRET environment variable is missing or empty. A non-empty secret is required for internal service communication.",
    )
  }

  const app = await NestFactory.create(GatewayModule)
  await app.listen(process.env.GATEWAY_PORT ?? 3333)
}
bootstrap()
