import { NestFactory } from "@nestjs/core"
import { type MicroserviceOptions, Transport } from "@nestjs/microservices"
import { GamificationModule } from "./gamification.module"
import { gamificationGrpcRegistry } from "./grpc/registry"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    GamificationModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.GAMIFICATION_GRPC_PORT}`,
        package: gamificationGrpcRegistry.package,
        protoPath: gamificationGrpcRegistry.protoPath,
        loader: gamificationGrpcRegistry.loader,
      },
    },
  )

  await app.listen()
}
bootstrap()
