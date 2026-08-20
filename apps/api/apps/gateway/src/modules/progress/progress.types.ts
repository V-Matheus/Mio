import { Field, ID, Int, ObjectType } from "@nestjs/graphql"

@ObjectType({ description: "Resumo do progresso do aluno em uma trilha" })
export class TrackProgressSummary {
  @Field(() => Int, { description: "ID numérico da trilha" })
  trackId!: number

  @Field(() => ID, { description: "Slug identificador da trilha" })
  trackSlug!: string

  @Field(() => String, { description: "Título da trilha" })
  trackTitle!: string

  @Field(() => Int, { description: "Quantidade total de aulas da trilha" })
  totalLessons!: number

  @Field(() => Int, {
    description: "Quantidade de aulas concluídas pelo aluno",
  })
  completedLessons!: number

  @Field(() => Int, { description: "Percentual de conclusão (0..100)" })
  progressPercentage!: number

  @Field(() => ID, {
    nullable: true,
    description: "Slug da aula atual/próxima",
  })
  currentLessonSlug?: string | null

  @Field(() => String, {
    nullable: true,
    description: "Título da aula atual/próxima",
  })
  currentLessonTitle?: string | null
}

@ObjectType({ description: "Entrada de atividade recente do aluno" })
export class RecentActivityEntry {
  @Field(() => Int, { description: "ID da lição concluída" })
  lessonId!: number

  @Field(() => ID, { description: "Slug da lição concluída" })
  lessonSlug!: string

  @Field(() => String, { description: "Título da lição concluída" })
  lessonTitle!: string

  @Field(() => ID, { description: "Slug da trilha correspondente" })
  trackSlug!: string

  @Field(() => String, { description: "Título da trilha correspondente" })
  trackTitle!: string

  @Field(() => String, {
    description: "Data/hora da conclusão em formato ISO-8601",
  })
  completedAt!: string
}

@ObjectType({ description: "Estatísticas agregadas de progresso do aluno" })
export class UserProfileStats {
  @Field(() => Int, { description: "Total de lições concluídas pelo aluno" })
  totalCompletedLessons!: number

  @Field(() => Int, {
    description: "Quantidade de trilhas concluídas integralmente",
  })
  completedTracksCount!: number
}
