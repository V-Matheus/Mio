export type LoginResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | { ok: false; error: string }
