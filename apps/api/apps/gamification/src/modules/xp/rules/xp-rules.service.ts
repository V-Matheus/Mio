import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"

export const XpRuleKey = {
  LESSON_COMPLETED: "LESSON_COMPLETED",
  TRACK_COMPLETED: "TRACK_COMPLETED",
  SECTION_COMPLETED: "SECTION_COMPLETED",
  EXERCISE_COMPLETED: "EXERCISE_COMPLETED",
} as const

export type XpRuleKey = (typeof XpRuleKey)[keyof typeof XpRuleKey]

export const DEFAULT_XP_RULES: Record<
  XpRuleKey,
  { amount: number; description: string }
> = {
  [XpRuleKey.LESSON_COMPLETED]: {
    amount: 50,
    description: "XP concedido ao concluir todas as seções de uma aula",
  },
  [XpRuleKey.TRACK_COMPLETED]: {
    amount: 200,
    description: "XP concedido ao finalizar todas as aulas de uma trilha/curso",
  },
  [XpRuleKey.SECTION_COMPLETED]: {
    amount: 10,
    description: "XP concedido ao concluir a leitura de uma seção",
  },
  [XpRuleKey.EXERCISE_COMPLETED]: {
    amount: 25,
    description: "XP concedido ao resolver um exercício prático",
  },
}

export type XpRuleDto = {
  key: string
  amount: number
  description: string
}

@Injectable()
export class XpRulesService implements OnModuleInit {
  private readonly logger = new Logger(XpRulesService.name)

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults().catch((err) => {
      this.logger.warn(
        `Falha ao popular regras padrão de XP: ${(err as Error).message}`,
      )
    })
  }

  /**
   * Garante que todas as regras padrão de XP estejam cadastradas no banco.
   */
  async seedDefaults(): Promise<void> {
    for (const [key, rule] of Object.entries(DEFAULT_XP_RULES)) {
      await this.prisma.xpRule.upsert({
        where: { key },
        create: {
          key,
          amount: rule.amount,
          description: rule.description,
        },
        update: {},
      })
    }
  }

  /**
   * Obtém a quantidade de XP configurada para uma fonte/regra específica.
   * Se não encontrada no banco, recorre ao valor padrão estático.
   */
  async getAmount(key: string): Promise<number> {
    try {
      const rule = await this.prisma.xpRule.findUnique({
        where: { key },
      })
      if (rule) {
        return rule.amount
      }
    } catch {
      // fallback em caso de erro temporário de banco
    }

    const defaultRule = DEFAULT_XP_RULES[key as XpRuleKey]
    return defaultRule?.amount ?? 0
  }

  /**
   * Atualiza ou cadastra o valor de XP de qualquer fonte em tempo de execução.
   */
  async setAmount(
    key: string,
    amount: number,
    description?: string,
  ): Promise<XpRuleDto> {
    const defaultDesc =
      DEFAULT_XP_RULES[key as XpRuleKey]?.description ??
      `Regra de XP para ${key}`

    const updated = await this.prisma.xpRule.upsert({
      where: { key },
      create: {
        key,
        amount,
        description: description ?? defaultDesc,
      },
      update: {
        amount,
        ...(description ? { description } : {}),
      },
    })

    return {
      key: updated.key,
      amount: updated.amount,
      description: updated.description,
    }
  }

  /**
   * Lista todas as regras de XP cadastradas no sistema.
   */
  async listRules(): Promise<XpRuleDto[]> {
    const rules = await this.prisma.xpRule.findMany({
      orderBy: { key: "asc" },
    })
    return rules.map((r) => ({
      key: r.key,
      amount: r.amount,
      description: r.description,
    }))
  }
}
