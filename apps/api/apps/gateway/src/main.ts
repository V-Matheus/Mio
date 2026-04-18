import { NestFactory } from "@nestjs/core"
import { GatewayModule } from "./gateway.module"

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule)
  await app.listen(process.env.GATEWAY_PORT ?? 3333)
}
bootstrap()
