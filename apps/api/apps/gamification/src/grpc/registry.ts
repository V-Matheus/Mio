import { gamificationContract, healthContract } from "@mio/grpc-contracts"

const contracts = [healthContract, gamificationContract]

export const gamificationGrpcRegistry = {
  package: contracts.map((contract) => contract.package),
  protoPath: contracts.map((contract) => contract.protoPath),
  loader: { enums: String },
}
