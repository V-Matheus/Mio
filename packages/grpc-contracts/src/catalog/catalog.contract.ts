import { join } from "node:path"
import type { GrpcContract } from "../grpc-contract"

export const catalogContract: GrpcContract = {
  package: "mio.catalog.v1",
  service: "CatalogService",
  clientToken: "CATALOG_PACKAGE",
  protoPath: join(__dirname, "catalog.proto"),
}
