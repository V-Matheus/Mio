import { join } from "node:path"
import type { GrpcContract } from "../grpc-contract"

/**
 * Health check gRPC (`grpc.health.v1`). Servido por todos os microsserviços e
 * consumido pelo gateway (que registra um cliente por serviço-alvo, então não
 * há `clientToken` único).
 */
export const healthContract: GrpcContract = {
  package: "grpc.health.v1",
  service: "Health",
  protoPath: join(__dirname, "health.proto"),
}
