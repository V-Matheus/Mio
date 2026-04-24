import { join } from "node:path"
import { NestFactory } from "@nestjs/core"
import { type MicroserviceOptions, Transport } from "@nestjs/microservices"
import { MessengerModule } from "./messenger.module"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MessengerModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.MESSENGER_GRPC_PORT}`,
        package: "grpc.health.v1",
        protoPath: join(process.cwd(), "proto/health.proto"),
      },
    },
  )

  await app.listen()
}
bootstrap()
