import { UseGuards } from "@nestjs/common"
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql"
import { z } from "zod"
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe"
import { AuthService } from "./auth.service"
import { LoginInput, loginSchema } from "./dto/login.input"
import { RegisterInput, registerSchema } from "./dto/register.input"
import { UpsertOAuthInput, upsertOAuthSchema } from "./dto/upsert-oauth.input"
import { CurrentUserCode, GqlAuthGuard } from "./guards/gql-auth.guard"
import { AuthPayload } from "./models/auth-payload.model"
import { User } from "./models/user.model"

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayload)
  register(
    @Args("input", new ZodValidationPipe(registerSchema)) input: RegisterInput,
  ): Promise<AuthPayload> {
    return this.auth.register(input)
  }

  @Mutation(() => AuthPayload)
  login(
    @Args("input", new ZodValidationPipe(loginSchema)) input: LoginInput,
  ): Promise<AuthPayload> {
    return this.auth.login(input)
  }

  @Mutation(() => AuthPayload)
  upsertOAuthUser(
    @Args("input", new ZodValidationPipe(upsertOAuthSchema))
    input: UpsertOAuthInput,
  ): Promise<AuthPayload> {
    return this.auth.upsertOAuthUser(input)
  }

  @Mutation(() => Boolean)
  requestPasswordReset(
    @Args("email", new ZodValidationPipe(loginSchema.shape.email))
    email: string,
  ): Promise<boolean> {
    return this.auth.requestPasswordReset(email)
  }

  @Mutation(() => Boolean)
  resetPassword(
    @Args(
      "token",
      new ZodValidationPipe(z.string().min(1, "Token obrigatório")),
    )
    token: string,
    @Args("newPassword", new ZodValidationPipe(registerSchema.shape.password))
    newPassword: string,
  ): Promise<boolean> {
    return this.auth.resetPassword(token, newPassword)
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUserCode() userCode: string): Promise<User> {
    return this.auth.me(userCode)
  }
}
