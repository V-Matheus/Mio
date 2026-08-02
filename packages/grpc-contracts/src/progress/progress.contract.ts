import { join } from "node:path"
import type { GrpcContract } from "../grpc-contract"

export const progressContract: GrpcContract = {
  package: "mio.progress.v1",
  service: "ProgressService",
  clientToken: "PROGRESS_PACKAGE",
  protoPath: join(__dirname, "../mio/progress/v1/progress.proto"),
}
