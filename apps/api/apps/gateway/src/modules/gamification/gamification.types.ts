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
