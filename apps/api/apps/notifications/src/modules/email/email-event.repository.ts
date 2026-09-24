import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../../core/src/modules/prisma/prisma.service"

@Injectable()
export class EmailEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async claimForDispatch(eventId: string): Promise<boolean> {
    const id = this.parseEventId(eventId)
    const result = await this.prisma.outboxEvent.updateMany({
      where: { id, emailDispatchClaimedAt: null },
      data: { emailDispatchClaimedAt: new Date() },
    })

    return result.count === 1
  }

  async releaseDispatchClaim(eventId: string): Promise<void> {
    const id = this.parseEventId(eventId)
    await this.prisma.outboxEvent.updateMany({
      where: { id, emailDispatchClaimedAt: { not: null } },
      data: { emailDispatchClaimedAt: null },
    })
  }

  private parseEventId(eventId: string): bigint {
    try {
      return BigInt(eventId)
    } catch {
      throw new Error(`x-outbox-id inválido: ${eventId}`)
    }
  }
}
