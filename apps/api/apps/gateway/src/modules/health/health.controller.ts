import { Controller, Get, Inject } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HealthIndicatorService,
} from "@nestjs/terminus"
import { firstValueFrom, type Observable, timeout } from "rxjs"

interface GrpcHealthClient {
  check(data: { service: string }): Observable<{ status: string }>
}

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicators: HealthIndicatorService,
    @Inject("CORE_PACKAGE") private readonly coreClient: ClientGrpc,
    @Inject("GAMIFICATION_PACKAGE")
    private readonly gamificationClient: ClientGrpc,
    @Inject("ACHIEVEMENTS_PACKAGE")
    private readonly achievementsClient: ClientGrpc,
  ) {}

  @Get("live")
  live() {
    return {
      status: "ok",
      service: "gateway",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }

  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.pingGrpc("core", this.coreClient),
      () => this.pingGrpc("gamification", this.gamificationClient),
      () => this.pingGrpc("achievements", this.achievementsClient),
    ])
  }

  private async pingGrpc(
    key: string,
    client: ClientGrpc,
  ): Promise<HealthIndicatorResult> {
    const indicator = this.indicators.check(key)
    try {
      const health = client.getService<GrpcHealthClient>("Health")
      const response = await firstValueFrom(
        health.check({ service: "" }).pipe(timeout(2000)),
      )
      const isHealthy = response.status === "SERVING"
      return isHealthy
        ? indicator.up()
        : indicator.down(`status=${response.status}`)
    } catch (error) {
      return indicator.down((error as Error).message)
    }
  }
}
