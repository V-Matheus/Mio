import { NestFactory } from "@nestjs/core"
import { type MicroserviceOptions, Transport } from "@nestjs/microservices"
import { AchievementsModule } from "./achievements.module"
import { achievementsGrpcRegistry } from "./grpc/registry"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AchievementsModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.ACHIEVEMENTS_GRPC_PORT}`,
        package: achievementsGrpcRegistry.package,
        protoPath: achievementsGrpcRegistry.protoPath,
        loader: achievementsGrpcRegistry.loader,
      },
    },
  )

  await app.listen()
}
bootstrap()
