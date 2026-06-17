export type LoginResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string }
