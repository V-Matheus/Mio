import { PrismaClient } from ".prisma/gamification"
import Redis from "ioredis"
import { calculateCompositeScore } from "../src/modules/leaderboard/leaderboard.service"

export const INITIAL_XP_RULES = [
  {
    key: "LESSON_COMPLETED",
    amount: 50,
    description: "XP concedido ao concluir todas as seções de uma aula",
  },
  {
    key: "TRACK_COMPLETED",
    amount: 200,
    description: "XP concedido ao finalizar todas as aulas de uma trilha/curso",
  },
  {
    key: "SECTION_COMPLETED",
    amount: 10,
    description: "XP concedido ao concluir a leitura de uma seção individual",
  },
  {
    key: "EXERCISE_COMPLETED",
    amount: 25,
    description: "XP concedido ao resolver com sucesso um exercício prático",
  },
  {
    key: "STREAK_BONUS_3D",
    amount: 30,
    description:
      "XP bônus por manter sequência de estudos ativa por 3 dias consecutivos",
  },
  {
    key: "STREAK_BONUS_7D",
    amount: 100,
    description:
      "XP bônus por manter sequência de estudos ativa por 7 dias consecutivos",
  },
] as const

export const DEMO_USERS_XP = [
  {
    userCode: "system-admin",
    total: 12500,
    reason: "Nível Especialista — Instrutor e Administrador",
  },
  {
    userCode: "aluno-ana",
    total: 4250,
    reason: "Nível Sênior — 85 aulas concluídas",
  },
  {
    userCode: "aluno-carlos",
    total: 1850,
    reason: "Nível Pleno — 37 aulas concluídas",
  },
  {
    userCode: "aluno-beatriz",
    total: 750,
    reason: "Nível Júnior — 15 aulas concluídas",
  },
  {
    userCode: "aluno-diego",
    total: 250,
    reason: "Nível Iniciante — 5 aulas concluídas",
  },
  {
    userCode: "aluno-fernanda",
    total: 50,
    reason: "Nível Leigo — 1 aula concluída",
  },
] as const

export async function seedGamificationRules(
  prisma: PrismaClient,
): Promise<number> {
  let count = 0

  for (const rule of INITIAL_XP_RULES) {
    await prisma.xpRule.upsert({
      where: { key: rule.key },
      create: {
        key: rule.key,
        amount: rule.amount,
        description: rule.description,
      },
      update: {},
    })
    count++
  }

  return count
}

export async function seedDemoUserXp(
  prisma: PrismaClient,
  redisClient?: Redis,
): Promise<number> {
  let count = 0
  const baseTime = Date.now() - 3600 * 1000

  for (let i = 0; i < DEMO_USERS_XP.length; i++) {
    const demo = DEMO_USERS_XP[i]
    if (!demo) continue
    const timestamp = baseTime - i * 60000

    await prisma.userXp.upsert({
      where: { userCode: demo.userCode },
      create: {
        userCode: demo.userCode,
        total: demo.total,
      },
      update: {
        total: demo.total,
      },
    })

    await prisma.xpTransaction.upsert({
      where: {
        userCode_sourceId: {
          userCode: demo.userCode,
          sourceId: "seed:initial_xp",
        },
      },
      create: {
        userCode: demo.userCode,
        amount: demo.total,
        reason: demo.reason,
        sourceId: "seed:initial_xp",
        createdAt: new Date(timestamp),
      },
      update: {
        amount: demo.total,
        reason: demo.reason,
        createdAt: new Date(timestamp),
      },
    })

    if (redisClient) {
      try {
        const score = calculateCompositeScore(demo.total, timestamp)
        await redisClient.zadd("mio:xp:global", score, demo.userCode)
      } catch {
        // Ignora erro do Redis se não estiver acessível no momento
      }
    }

    count++
  }

  return count
}

async function main() {
  const prisma = new PrismaClient()
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
  let redis: Redis | undefined
  let candidate: Redis | undefined

  try {
    candidate = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
    await candidate.connect().catch(() => {
      candidate?.disconnect()
      candidate = undefined
    })
    redis = candidate
  } catch {
    candidate?.disconnect()
    redis = undefined
  }

  try {
    console.log("🌱 Iniciando seed de Gamificação...")
    const rulesCount = await seedGamificationRules(prisma)
    console.log(`✅ ${rulesCount} regras de XP mapeadas no banco.`)

    const usersCount = await seedDemoUserXp(prisma, redis)
    console.log(
      `✅ ${usersCount} usuários de demonstração com pontuações de XP no Postgres e Redis.`,
    )
  } catch (error) {
    console.error("❌ Erro ao executar seed de gamificação:", error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
    if (redis) {
      if (redis.status === "ready") {
        try {
          await redis.quit()
        } catch {
          redis.disconnect()
        }
      } else {
        redis.disconnect()
      }
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Seed de gamificação falhou: ${(error as Error).message}`)
    process.exitCode = 1
  })
}
