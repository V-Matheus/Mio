const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const path = require("node:path")

const port = process.env.HEALTHCHECK_GRPC_PORT
if (!port) {
  process.exit(1)
}

const protoPath = path.join(
  "/app/packages/grpc-contracts/dist/grpc/health/v1/health.proto",
)
const definition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  defaults: true,
  oneofs: true,
})
const health = grpc.loadPackageDefinition(definition).grpc.health.v1
const client = new health.Health(
  `127.0.0.1:${port}`,
  grpc.credentials.createInsecure(),
)
const deadline = Date.now() + 4000

client.check({ service: "" }, { deadline }, (error, response) => {
  client.close()
  if (error || response?.status !== 1) {
    process.exitCode = 1
  }
})
