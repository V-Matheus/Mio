import { join } from "node:path"
import type { GrpcContract } from "../grpc-contract"

export const usersContract: GrpcContract = {
  package: "mio.users.v1",
  service: "UsersService",
  clientToken: "USERS_PACKAGE",
  protoPath: join(__dirname, "users.proto"),
}
