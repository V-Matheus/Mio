import { getSessionUser } from "@/lib/auth/utils/getSessionUser"

export default async function HomePage() {
  const user = await getSessionUser()
  const firstName = user.name?.split(/\s+/)[0] ?? "dev"

  return (
    <section>
      <h1 className="font-display font-bold text-2xl text-foreground md:text-3xl">
        Olá, {firstName}! 👋
      </h1>
      <p className="mt-2 text-foreground/60">
        Seu painel está a caminho. Por enquanto, explore seu perfil.
      </p>
    </section>
  )
}
