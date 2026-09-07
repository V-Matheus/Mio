import { progressContract } from "@mio/grpc-contracts"
import { type ClientProviderOptions, Transport } from "@nestjs/microservices"

export const CORE_PACKAGE_TOKEN = "PROGRESS_PACKAGE"

export const coreClientOptions: ClientProviderOptions = {
  name: CORE_PACKAGE_TOKEN,
  transport: Transport.GRPC,
  options: {
    url: `api-core:${process.env.CORE_GRPC_PORT || 5001}`,
    package: progressContract.package,
    protoPath: progressContract.protoPath,
    loader: { enums: String },
  },
}
