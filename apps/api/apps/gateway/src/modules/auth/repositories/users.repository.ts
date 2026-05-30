import type { Observable } from "rxjs"

export interface GrpcUserResponse {
  code: string
  email: string
  name: string
  avatarUrl: string
}

export interface GrpcPasswordResetToken {
  token: string
  expiresAt: string
}

/** Espelha `UsersService` do `mio.users.v1` (ver proto co-localizado no Core). */
export interface UsersServiceClient {
  register(data: {
    email: string
    name: string
    password: string
  }): Observable<GrpcUserResponse>

  validateCredentials(data: {
    email: string
    password: string
  }): Observable<GrpcUserResponse>

  findByEmail(data: { email: string }): Observable<GrpcUserResponse>

  findByCode(data: { code: string }): Observable<GrpcUserResponse>

  upsertOAuthUser(data: {
    provider: string
    providerAccountId: string
    email: string
    name: string
    avatarUrl: string
  }): Observable<GrpcUserResponse>

  issuePasswordReset(data: {
    email: string
  }): Observable<GrpcPasswordResetToken>

  consumePasswordReset(data: {
    token: string
    newPassword: string
  }): Observable<GrpcUserResponse>
}
