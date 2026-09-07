import { PrismaClient } from ".prisma/achievements"

export const INITIAL_ACHIEVEMENTS = [
  {
    slug: "first-lesson",
    title: "Primeiro passo",
    description: "Conclua sua primeira lição.",
    ruleType: "LESSONS_COMPLETED",
    threshold: 1,
    xpReward: 25,
  },
  {
    slug: "ten-lessons",
    title: "Maratonista",
    description: "Conclua 10 lições.",
    ruleType: "LESSONS_COMPLETED",
    threshold: 10,
    xpReward: 100,
  },
  {
    slug: "fifty-lessons",
    title: "Veterano",
    description: "Conclua 50 lições.",
    ruleType: "LESSONS_COMPLETED",
    threshold: 50,
    xpReward: 300,
  },
  {
    slug: "xp-100",
    title: "Acendendo a chama",
    description: "Acumule 100 XP.",
    ruleType: "TOTAL_XP",
    threshold: 100,
    xpReward: 20,
  },
  {
    slug: "xp-500",
    title: "Em chamas",
    description: "Acumule 500 XP.",
    ruleType: "TOTAL_XP",
    threshold: 500,
    xpReward: 50,
  },
  {
    slug: "xp-1000",
    title: "Imparável",
    description: "Acumule 1000 XP.",
    ruleType: "TOTAL_XP",
    threshold: 1000,
    xpReward: 100,
  },
  {
    slug: "xp-5000",
    title: "Fênix",
    description: "Acumule 5000 XP.",
    ruleType: "TOTAL_XP",
    threshold: 5000,
    xpReward: 250,
  },
  {
    slug: "streak-3",
    title: "Chama acesa",
    description: "Mantenha uma sequência de 3 dias consecutivos de estudo.",
    ruleType: "STREAK_DAYS",
    threshold: 3,
    xpReward: 30,
  },
  {
    slug: "streak-7",
    title: "Uma semana em chamas",
    description: "Mantenha uma sequência de 7 dias consecutivos de estudo.",
    ruleType: "STREAK_DAYS",
    threshold: 7,
    xpReward: 100,
  },
  {
    slug: "streak-30",
    title: "Chama eterna",
    description: "Mantenha uma sequência de 30 dias consecutivos de estudo.",
    ruleType: "STREAK_DAYS",
    threshold: 30,
    xpReward: 400,
  },
] as const

export async function seedAchievements(prisma: PrismaClient): Promise<number> {
  let count = 0

  for (const achievement of INITIAL_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      create: {
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        ruleType: achievement.ruleType,
        threshold: achievement.threshold,
        xpReward: achievement.xpReward,
      },
      update: {
        title: achievement.title,
        description: achievement.description,
        ruleType: achievement.ruleType,
        threshold: achievement.threshold,
        xpReward: achievement.xpReward,
      },
    })
    count++
  }

  return count
}

async function main() {
  const prisma = new PrismaClient()

  try {
    console.log("🌱 Iniciando seed de Conquistas...")
    const count = await seedAchievements(prisma)
    console.log(`✅ ${count} conquistas mapeadas no banco.`)
  } catch (error) {
    console.error("❌ Erro ao executar seed de conquistas:", error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Seed de conquistas falhou: ${(error as Error).message}`)
    process.exitCode = 1
  })
}
