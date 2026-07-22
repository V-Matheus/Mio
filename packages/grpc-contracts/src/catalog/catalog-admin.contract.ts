import { join } from "node:path"
import type { GrpcContract } from "../grpc-contract"

export const catalogAdminContract: GrpcContract = {
  package: "mio.catalog.admin.v1",
  service: "CatalogAdminService",
  clientToken: "CATALOG_ADMIN_PACKAGE",
  protoPath: join(__dirname, "catalog-admin.proto"),
}
