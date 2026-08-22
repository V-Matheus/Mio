export type RegisterResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | { ok: false; error: string }
