import { join } from "node:path"
import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TerminusModule } from "@nestjs/terminus"
import { HealthController } from "./health.controller"

const grpcHealthProtoPath = join(process.cwd(), "proto/health.proto")

const grpcClient = (name: string, host: string, portEnv: string) => ({
  name,
  transport: Transport.GRPC as const,
  options: {
    url: `${host}:${process.env[portEnv]}`,
    package: "grpc.health.v1",
    protoPath: grpcHealthProtoPath,
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
