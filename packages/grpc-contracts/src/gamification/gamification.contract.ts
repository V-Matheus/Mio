import { join } from "node:path"
import type { GrpcContract } from "../grpc-contract"

export const gamificationContract: GrpcContract = {
  package: "mio.gamification.v1",
  service: "GamificationService",
  clientToken: "GAMIFICATION_PACKAGE",
  protoPath: join(__dirname, "../mio/gamification/v1/gamification.proto"),
}
