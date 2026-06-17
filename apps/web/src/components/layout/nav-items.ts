export type NavItem = {
  label: string
  href: string
  icon: string
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/home", icon: "lucide:home" },
  { label: "Trilhas", href: "/trilhas", icon: "lucide:book-open" },
]
