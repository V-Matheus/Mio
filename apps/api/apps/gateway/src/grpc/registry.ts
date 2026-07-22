import {
  catalogAdminContract,
  catalogContract,
  type GrpcContract,
  usersContract,
} from "@mio/grpc-contracts"
import { type ClientProviderOptions, Transport } from "@nestjs/microservices"

type GrpcTarget = {
  contract: GrpcContract
  host: string
  portEnv: string
}

const targets: GrpcTarget[] = [
  { contract: usersContract, host: "api-core", portEnv: "CORE_GRPC_PORT" },
  { contract: catalogContract, host: "api-core", portEnv: "CORE_GRPC_PORT" },
  {
    contract: catalogAdminContract,
    host: "api-core",
    portEnv: "CORE_GRPC_PORT",
  },
]

function requireClientToken(contract: GrpcContract): string {
  if (!contract.clientToken) {
    throw new Error(`Contrato gRPC ${contract.package} não define clientToken`)
  }
  return contract.clientToken
}

export const USERS_PACKAGE_TOKEN = requireClientToken(usersContract)
export const CATALOG_PACKAGE_TOKEN = requireClientToken(catalogContract)
export const CATALOG_ADMIN_PACKAGE_TOKEN =
  requireClientToken(catalogAdminContract)

export const gatewayGrpcClients: ClientProviderOptions[] = targets.map(
  ({ contract, host, portEnv }) => ({
    name: requireClientToken(contract),
    transport: Transport.GRPC,
    options: {
      url: `${host}:${process.env[portEnv]}`,
      package: contract.package,
      protoPath: contract.protoPath,
      loader: { enums: String },
    },
  }),
)
