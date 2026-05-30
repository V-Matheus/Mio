import { NestFactory } from "@nestjs/core"
import { type MicroserviceOptions, Transport } from "@nestjs/microservices"
import { CoreModule } from "./core.module"
import { coreGrpcRegistry } from "./grpc/registry"

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CoreModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${process.env.CORE_GRPC_PORT}`,
        package: coreGrpcRegistry.package,
        protoPath: coreGrpcRegistry.protoPath,
        loader: coreGrpcRegistry.loader,
      },
    },
  )

  await app.listen()
}
bootstrap()
