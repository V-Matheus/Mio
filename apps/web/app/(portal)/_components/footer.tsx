import { Icon } from "@iconify/react"
import Image from "next/image"

const quickLinks = [
  { label: "Home", href: "#" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Tecnologias", href: "#tecnologias" },
  { label: "Benefícios", href: "#beneficios" },
]

const supportLinks = [
  { label: "Suporte", href: "#" },
  { label: "FAQ", href: "#" },
]

const socialLinks = [
  { icon: "mdi:facebook", href: "#", label: "Facebook" },
  { icon: "mdi:twitter", href: "#", label: "Twitter" },
  { icon: "mdi:instagram", href: "#", label: "Instagram" },
  { icon: "mdi:linkedin", href: "#", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Mio"
                width={72}
                height={28}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/60 mb-4">
              Plataforma de aprendizado de programação interativa e divertida.
              Aprenda e progresse com o Mio!
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-white/60 hover:text-primary transition-colors"
                >
                  <Icon icon={social.icon} width={20} height={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm mb-4">Suporte</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Icon icon="mdi:email-outline" width={16} height={16} />
                contato@mio.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-white/40">
          © 2026 Mio. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
