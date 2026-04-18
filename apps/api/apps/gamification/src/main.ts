import { NestFactory } from "@nestjs/core"
import { GamificationModule } from "./gamification.module"

async function bootstrap() {
  const app = await NestFactory.create(GamificationModule)
  await app.listen(process.env.GAMIFICATION_PORT ?? 3002)
}
bootstrap()
