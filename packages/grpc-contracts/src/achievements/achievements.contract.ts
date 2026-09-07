import { join } from "node:path"
import type { GrpcContract } from "../grpc-contract"

export const achievementsContract: GrpcContract = {
  package: "mio.achievements.v1",
  service: "AchievementsService",
  clientToken: "ACHIEVEMENTS_PACKAGE",
  protoPath: join(__dirname, "../mio/achievements/v1/achievements.proto"),
}
