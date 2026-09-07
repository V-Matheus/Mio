import { signOutAction } from "@/modules/auth/actions"

// Server Components não podem persistir o Set-Cookie de logout (ver auth.ts);
// Route Handlers podem. Redirecione aqui para encerrar a sessão de verdade.
export async function GET() {
  await signOutAction()
}
