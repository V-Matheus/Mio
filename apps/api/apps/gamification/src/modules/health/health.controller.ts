import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"

enum ServingStatus {
  UNKNOWN = 0,
  SERVING = 1,
  NOT_SERVING = 2,
}

@Controller()
export class HealthController {
  @GrpcMethod("Health", "Check")
  check(): { status: ServingStatus } {
    return { status: ServingStatus.SERVING }
  }
}
