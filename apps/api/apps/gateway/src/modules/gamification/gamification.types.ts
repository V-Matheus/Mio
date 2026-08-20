import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql"

export enum Level {
  LEIGO = "LEIGO",
  INICIANTE = "INICIANTE",
  JUNIOR = "JUNIOR",
  PLENO = "PLENO",
  SENIOR = "SENIOR",
  ESPECIALISTA = "ESPECIALISTA",
}

registerEnumType(Level, {
  name: "Level",
  description: "Nível de graduação por XP do usuário",
})

@ObjectType({ description: "Informações de XP e nível do usuário" })
export class UserXp {
  @Field(() => Int, { description: "XP total acumulado" })
  total!: number

  @Field(() => Level, { description: "Nível atual de graduação" })
  level!: Level

  @Field(() => Int, {
    description: "Percentual de progresso para o próximo nível (0..100)",
  })
  progressToNext!: number

  @Field(() => Int, {
    description: "XP restante para alcançar o próximo nível",
  })
  xpToNextLevel!: number

  @Field(() => Int, {
    description: "Posição global no ranking (1-based, 0 se não classificado)",
  })
  rank!: number
}

@ObjectType({ description: "Item da listagem de ranking global" })
export class LeaderboardEntry {
  @Field(() => ID, { description: "Código único do usuário" })
  userCode!: string

  @Field(() => String, { description: "Nome de exibição do usuário" })
  name!: string

  @Field(() => String, {
    nullable: true,
    description: "URL da foto de perfil do usuário",
  })
  avatarUrl?: string | null

  @Field(() => Int, { description: "Pontuação total de XP" })
  total!: number

  @Field(() => Int, { description: "Posição no ranking global (1-based)" })
  rank!: number

  @Field(() => String, { description: "Nível atual do usuário" })
  level!: string
}

@ObjectType({ description: "Informações de ofensiva (streak) do usuário" })
export class StreakInfo {
  @Field(() => Int, { description: "Sequência atual de dias consecutivos" })
  streakCurrent!: number

  @Field(() => Int, { description: "Melhor sequência histórica alcançada" })
  streakBest!: number

  @Field(() => String, {
    nullable: true,
    description: "Data do último dia de estudo registrado (ISO-8601)",
  })
  lastStudyDate?: string | null
}

@ObjectType({ description: "XP ganho em um dia da semana" })
export class WeeklyXpDay {
  @Field(() => String, { description: "Rótulo do dia (ex.: Seg, Ter...)" })
  day!: string

  @Field(() => String, { description: "Data civil no formato YYYY-MM-DD" })
  date!: string

  @Field(() => Int, { description: "Total de XP acumulado no dia" })
  xp!: number
}

@ObjectType({ description: "Resumo semanal de XP" })
export class WeeklyXpSummary {
  @Field(() => [WeeklyXpDay], { description: "Distribuição diária de XP" })
  days!: WeeklyXpDay[]

  @Field(() => Int, { description: "Total de XP acumulado na semana" })
  totalWeeklyXp!: number
}
