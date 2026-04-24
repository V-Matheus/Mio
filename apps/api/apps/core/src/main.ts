import { join } from "node:path"
import { NestFactory } from "@nestjs/core"
import { type MicroserviceOptions, Transport } from "@nestjs/microservices"
import { CoreModule } from "./core.module"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CoreModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.CORE_GRPC_PORT}`,
        package: "grpc.health.v1",
        protoPath: join(process.cwd(), "proto/health.proto"),
      },
    },
  )

  await app.listen()
}
bootstrap()
