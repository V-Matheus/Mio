import { healthContract } from "@mio/grpc-contracts"
import { NestFactory } from "@nestjs/core"
import { type MicroserviceOptions, Transport } from "@nestjs/microservices"
import { AchievementsModule } from "./achievements.module"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AchievementsModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.ACHIEVEMENTS_GRPC_PORT}`,
        package: healthContract.package,
        protoPath: healthContract.protoPath,
      },
    },
  )

  await app.listen()
}
bootstrap()
