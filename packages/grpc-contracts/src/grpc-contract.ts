/**
 * Descritor de um contrato gRPC compartilhado entre serviços. Definido uma única
 * vez neste pacote (`@mio/grpc-contracts`) e consumido tanto pelo servidor (que
 * implementa o serviço) quanto pelos clientes (gateway). Cada domínio mora numa
 * pasta própria com seu `.proto` co-localizado.
 */
export interface GrpcContract {
  /** Nome do pacote protobuf, ex.: "mio.users.v1". */
  package: string
  /** Nome do serviço gRPC, ex.: "UsersService" (usado em `@GrpcMethod`/`getService`). */
  service: string
  /**
   * Token de injeção do `ClientGrpc` nos consumidores, ex.: "USERS_PACKAGE".
   * Opcional: contratos servidos por vários serviços (ex.: health) não têm um
   * token único — o consumidor define o token por alvo.
   */
  clientToken?: string
  /** Caminho absoluto do `.proto`, co-localizado neste pacote. */
  protoPath: string
}
