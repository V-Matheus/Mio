import { gamificationContract } from "@mio/grpc-contracts"
import { type ClientProviderOptions, Transport } from "@nestjs/microservices"

export const GAMIFICATION_PACKAGE_TOKEN = "GAMIFICATION_PACKAGE"

export const gamificationClientOptions: ClientProviderOptions = {
  name: GAMIFICATION_PACKAGE_TOKEN,
  transport: Transport.GRPC,
  options: {
    url: `api-gamification:${process.env.GAMIFICATION_GRPC_PORT || 5002}`,
    package: gamificationContract.package,
    protoPath: gamificationContract.protoPath,
    loader: { enums: String },
  },
}
