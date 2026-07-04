import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { catalogError } from "./errors/catalog.errors"

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Idempotente: matricular-se duas vezes é no-op (`@@unique(userId, trackId)`). */
  async enroll(userCode: string, trackSlug: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { code: userCode },
    })
    if (!user) {
      throw catalogError("USER_NOT_FOUND")
    }

    const track = await this.prisma.track.findUnique({
      where: { slug: trackSlug },
    })
    if (!track) {
      throw catalogError("TRACK_NOT_FOUND")
    }

    await this.prisma.enrollment.upsert({
      where: { userId_trackId: { userId: user.id, trackId: track.id } },
      create: { userId: user.id, trackId: track.id },
      update: {},
    })
  }
}
