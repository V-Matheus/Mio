import { Field, ID, Int, ObjectType } from "@nestjs/graphql"

@ObjectType({ description: "Conquista disponível na plataforma" })
export class Achievement {
  @Field(() => ID, { description: "Identificador único da conquista" })
  slug!: string

  @Field(() => String, { description: "Título de exibição da conquista" })
  title!: string

  @Field(() => String, { description: "Descrição de como desbloqueá-la" })
  description!: string

  @Field(() => String, {
    nullable: true,
    description: "URL da ilustração/insígnia da conquista",
  })
  iconUrl?: string | null

  @Field(() => String, {
    description:
      "Tipo de regra que rege o desbloqueio (ex.: LESSONS_COMPLETED, TOTAL_XP)",
  })
  ruleType!: string

  @Field(() => Int, { description: "Valor limite necessário para desbloquear" })
  threshold!: number
}

@ObjectType({
  description: "Conquista com o progresso do usuário logado",
})
export class UserAchievement {
  @Field(() => ID, { description: "Identificador único da conquista" })
  slug!: string

  @Field(() => String, { description: "Título de exibição da conquista" })
  title!: string

  @Field(() => String, { description: "Descrição de como desbloqueá-la" })
  description!: string

  @Field(() => String, {
    nullable: true,
    description: "URL da ilustração/insígnia da conquista",
  })
  iconUrl?: string | null

  @Field(() => Boolean, {
    description: "Indica se o usuário já desbloqueou esta conquista",
  })
  unlocked!: boolean

  @Field(() => String, {
    nullable: true,
    description: "Data (ISO-8601) em que a conquista foi desbloqueada",
  })
  unlockedAt?: string | null

  @Field(() => Int, {
    description: "Progresso atual do usuário (0..threshold)",
  })
  progress!: number

  @Field(() => Int, { description: "Valor limite necessário para desbloquear" })
  threshold!: number
}

@ObjectType({ description: "Página paginada do catálogo de conquistas" })
export class AchievementsPage {
  @Field(() => [Achievement], { description: "Conquistas da página atual" })
  items!: Achievement[]

  @Field(() => Int, { description: "Total de conquistas disponíveis" })
  total!: number
}

@ObjectType({
  description: "Página paginada de conquistas com o progresso do usuário",
})
export class UserAchievementsPage {
  @Field(() => [UserAchievement], { description: "Conquistas da página atual" })
  items!: UserAchievement[]

  @Field(() => Int, { description: "Total de conquistas disponíveis" })
  total!: number

  @Field(() => Int, {
    description: "Total de conquistas já desbloqueadas pelo usuário",
  })
  unlockedTotal!: number
}
