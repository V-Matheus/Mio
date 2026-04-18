import { NestFactory } from "@nestjs/core"
import { AchievementsModule } from "./achievements.module"

async function bootstrap() {
  const app = await NestFactory.create(AchievementsModule)
  await app.listen(process.env.ACHIEVEMENTS_PORT ?? 3003)
}
bootstrap()
