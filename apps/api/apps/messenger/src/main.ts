import { healthContract } from "@mio/grpc-contracts"
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
        package: healthContract.package,
        protoPath: healthContract.protoPath,
      },
    },
  )

  await app.listen()
}
bootstrap()
