import {
  catalogAdminContract,
  catalogContract,
  healthContract,
  usersContract,
} from "@mio/grpc-contracts"

/**
 * Registry agregador dos serviços gRPC expostos pelo Core. Os contratos vêm da
 * lib compartilhada `@mio/grpc-contracts` (única fonte de pacote + proto); o
 * `main.ts` consome os pacotes/protos como arrays.
 */
const contracts = [
  healthContract,
  usersContract,
  catalogContract,
  catalogAdminContract,
]

export const coreGrpcRegistry = {
  package: contracts.map((contract) => contract.package),
  protoPath: contracts.map((contract) => contract.protoPath),
  loader: { enums: String },
}
