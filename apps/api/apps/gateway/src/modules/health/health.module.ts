import { healthContract } from "@mio/grpc-contracts"
import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TerminusModule } from "@nestjs/terminus"
import { HealthController } from "./health.controller"

const grpcClient = (name: string, host: string, portEnv: string) => ({
  name,
  transport: Transport.GRPC as const,
  options: {
    url: `${host}:${process.env[portEnv]}`,
    package: healthContract.package,
    protoPath: healthContract.protoPath,
    loader: { enums: String },
  },
})

@Module({
  imports: [
    TerminusModule,
    ClientsModule.register([
      grpcClient("CORE_PACKAGE", "api-core", "CORE_GRPC_PORT"),
      grpcClient(
        "GAMIFICATION_PACKAGE",
        "api-gamification",
        "GAMIFICATION_GRPC_PORT",
      ),
      grpcClient(
        "ACHIEVEMENTS_PACKAGE",
        "api-achievements",
        "ACHIEVEMENTS_GRPC_PORT",
      ),
    ]),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
