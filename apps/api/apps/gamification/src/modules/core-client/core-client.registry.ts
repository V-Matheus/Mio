import { usersContract } from "@mio/grpc-contracts"
import { type ClientProviderOptions, Transport } from "@nestjs/microservices"

export const USERS_PACKAGE_TOKEN = "USERS_PACKAGE"

export const coreClientOptions: ClientProviderOptions = {
  name: USERS_PACKAGE_TOKEN,
  transport: Transport.GRPC,
  options: {
    url: `api-core:${process.env.CORE_GRPC_PORT || 5001}`,
    package: usersContract.package,
    protoPath: usersContract.protoPath,
    loader: { enums: String },
  },
}
