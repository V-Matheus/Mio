import {
  catalogContract,
  type GrpcContract,
  usersContract,
} from "@mio/grpc-contracts"
import { type ClientProviderOptions, Transport } from "@nestjs/microservices"

/**
 * Registry dos clientes gRPC consumidos pelo gateway. O pacote e o caminho do
 * `.proto` vêm do contrato compartilhado (`@mio/grpc-contracts`); o gateway só
 * acrescenta o roteamento (host + env da porta) de cada serviço-alvo.
 *
 * Adicionar um novo serviço = uma linha em `targets`.
 */
type GrpcTarget = {
  contract: GrpcContract
  host: string
  portEnv: string
}

const targets: GrpcTarget[] = [
  { contract: usersContract, host: "api-core", portEnv: "CORE_GRPC_PORT" },
  { contract: catalogContract, host: "api-core", portEnv: "CORE_GRPC_PORT" },
]

/** Garante que o contrato é consumível como cliente (tem token de injeção). */
function requireClientToken(contract: GrpcContract): string {
  if (!contract.clientToken) {
    throw new Error(`Contrato gRPC ${contract.package} não define clientToken`)
  }
  return contract.clientToken
}

export const USERS_PACKAGE_TOKEN = requireClientToken(usersContract)
export const CATALOG_PACKAGE_TOKEN = requireClientToken(catalogContract)

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
