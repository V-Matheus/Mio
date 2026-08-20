import { Field, ObjectType } from "@nestjs/graphql"
import { User } from "../auth/models/user.model"
import {
  StreakInfo,
  UserXp,
  WeeklyXpSummary,
} from "../gamification/gamification.types"
import {
  RecentActivityEntry,
  TrackProgressSummary,
  UserProfileStats,
} from "../progress/progress.types"

@ObjectType({
  description: "Perfil consolidado do aluno com XP, estatísticas e atividades",
})
export class UserProfile {
  @Field(() => User, { description: "Dados cadastrais do usuário" })
  user!: User

  @Field(() => UserXp, { description: "Pontuação de XP, nível e ranking" })
  xp!: UserXp

  @Field(() => StreakInfo, {
    description: "Sequência de ofensiva diária (dias consecutivos)",
  })
  streak!: StreakInfo

  @Field(() => UserProfileStats, {
    description: "Métricas consolidadas de progresso pedagógico",
  })
  stats!: UserProfileStats

  @Field(() => WeeklyXpSummary, {
    description: "Histórico semanal de XP (Segunda a Domingo)",
  })
  weeklyXp!: WeeklyXpSummary

  @Field(() => [TrackProgressSummary], {
    description: "Trilhas em andamento com percentual de conclusão",
  })
  inProgressTracks!: TrackProgressSummary[]

  @Field(() => [RecentActivityEntry], {
    description: "Histórico das últimas lições concluídas",
  })
  recentActivities!: RecentActivityEntry[]
}
