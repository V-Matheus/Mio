import Image from "next/image"
import Link from "next/link"
import { ButtonText, ButtonWrapper } from "../../components/button"

const navLinks = [
  { label: "Início", href: "#top" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Tecnologias", href: "#tecnologias" },
  { label: "Benefícios", href: "#beneficios" },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href={"#top"}>
          <Image src="/logo.png" alt="Mio" width={128} height={48} />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors hidden sm:block"
          >
            Login
          </Link>
          <ButtonWrapper className="px-6! py-2! text-sm">
            <ButtonText>Começa agora</ButtonText>
          </ButtonWrapper>
        </div>
      </div>
    </header>
  )
}
