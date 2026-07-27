export type NavItem = {
  label: string
  href: string
  icon: string
  disabled?: boolean
  roles?: string[]
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/home", icon: "lucide:home" },
  { label: "Cursos", href: "/trilhas", icon: "lucide:book-open" },
  {
    label: "Desafios",
    href: "/desafios",
    icon: "lucide:gamepad-2",
    disabled: true,
  },
  {
    label: "Comunidade",
    href: "/comunidade",
    icon: "lucide:message-square",
    disabled: true,
  },
  {
    label: "Estúdio",
    href: "/studio",
    icon: "lucide:feather",
    roles: ["TEACHER", "ADMIN"],
  },
  {
    label: "Painel Geral",
    href: "/painel",
    icon: "lucide:shield-alert",
    roles: ["ADMIN"],
  },
]
