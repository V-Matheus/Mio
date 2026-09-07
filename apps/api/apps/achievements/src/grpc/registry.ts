import { achievementsContract, healthContract } from "@mio/grpc-contracts"

const contracts = [healthContract, achievementsContract]

export const achievementsGrpcRegistry = {
  package: contracts.map((contract) => contract.package),
  protoPath: contracts.map((contract) => contract.protoPath),
  loader: { enums: String },
}
