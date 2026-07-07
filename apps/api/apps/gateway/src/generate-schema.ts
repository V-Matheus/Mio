import { NestFactory } from "@nestjs/core"
import { GatewayModule } from "./gateway.module"

async function generate() {
  const app = await NestFactory.create(GatewayModule)
  await app.init()
  await app.close()
}

generate()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error("GENERATE ERROR:", err)
    process.exit(1)
  })
