export interface DomainEvent<TPayload = unknown> {
  readonly routingKey: string
  readonly payload: TPayload
  readonly version?: number
  readonly correlationId?: string
}

export class LessonCompletedEvent
  implements
    DomainEvent<{
      userCode: string
      trackSlug: string
      lessonSlug: string
      lessonId: string
      trackId: string
      completedAt: string
    }>
{
  readonly routingKey = "lesson.completed"
  readonly version = 1

  constructor(
    readonly payload: {
      userCode: string
      trackSlug: string
      lessonSlug: string
      lessonId: string
      trackId: string
      completedAt: string
    },
  ) {}
}

export class UserRegisteredEvent
  implements
    DomainEvent<{
      userCode: string
      email: string
      name: string
      registeredAt: string
    }>
{
  readonly routingKey = "user.registered"
  readonly version = 1

  constructor(
    readonly payload: {
      userCode: string
      email: string
      name: string
      registeredAt: string
    },
  ) {}
}

export class UserPasswordResetRequestedEvent
  implements
    DomainEvent<{
      userCode: string
      email: string
      resetToken: string
      expiresAt: string
    }>
{
  readonly routingKey = "user.password_reset_requested"
  readonly version = 1

  constructor(
    readonly payload: {
      userCode: string
      email: string
      resetToken: string
      expiresAt: string
    },
  ) {}
}
