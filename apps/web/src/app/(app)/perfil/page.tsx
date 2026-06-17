import { AvatarImage, AvatarWrapper } from "@/components/avatar"
import { CardWrapper } from "@/components/card"
import { getSessionUser } from "@/lib/auth/utils/getSessionUser"

export default async function PerfilPage() {
  const user = await getSessionUser()

  return (
    <section className="space-y-6">
      <CardWrapper className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
        <AvatarWrapper size="xl">
          <AvatarImage src={user.image} name={user.name} />
        </AvatarWrapper>

        <div className="min-w-0">
          <h1 className="font-display font-bold text-2xl text-foreground">
            {user.name ?? "Usuário"}
          </h1>
          <p className="truncate text-foreground/60">{user.email}</p>
        </div>
      </CardWrapper>

      <CardWrapper className="text-foreground/60 text-sm">
        Estatísticas, conquistas e histórico de atividades chegam em breve.
      </CardWrapper>
    </section>
  )
}
