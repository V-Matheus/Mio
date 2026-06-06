export type RegisterResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string }
