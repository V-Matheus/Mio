import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { PrismaService } from "../prisma/prisma.service"

enum ServingStatus {
  UNKNOWN = 0,
  SERVING = 1,
  NOT_SERVING = 2,
}

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @GrpcMethod("Health", "Check")
  async check(): Promise<{ status: ServingStatus }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: ServingStatus.SERVING }
    } catch {
      return { status: ServingStatus.NOT_SERVING }
    }
  }
}
