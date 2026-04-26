import Image from "next/image"

export function LoginSidePanel() {
  return (
    <aside className="relative hidden flex-col items-center justify-between bg-gradient-to-b from-primary to-primary-shadow px-12 py-14 text-white lg:flex">
      <div className="self-start">
        <h1 className="font-display text-5xl font-bold leading-none">Mio</h1>
        <p className="mt-2 text-sm text-white/80">
          Plataforma de Aprendizado de Programação
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Image
          src="/mio-ok.png"
          alt="Mio mascote dando boas-vindas"
          width={320}
          height={300}
          priority
        />
      </div>

      <p className="max-w-sm text-center text-sm text-white/85">
        Aprenda programação de forma divertida e interativa com o Mio ao seu
        lado!
      </p>
    </aside>
  )
}
