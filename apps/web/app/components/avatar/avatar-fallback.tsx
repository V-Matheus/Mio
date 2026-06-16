import type { ComponentProps } from "react"

interface AvatarFallbackProps extends ComponentProps<"span"> {
  name?: string | null
}

/**
 * Deriva as iniciais de um nome: primeira letra do primeiro e do último nome
 * (ex.: "Victor Matheus" → "VM"). Retorna "?" quando não há nome.
 */
export function getInitials(name?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? []

  if (parts.length === 0) {
    return "?"
  }

  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""

  return `${first}${last}`.toUpperCase()
}

export function AvatarFallback({
  name,
  className = "",
  children,
  ...props
}: AvatarFallbackProps) {
  const classes = ["inline-flex items-center justify-center", className]
    .filter(Boolean)
    .join(" ")

  return (
    <span aria-hidden className={classes} {...props}>
      {children ?? getInitials(name)}
    </span>
  )
}
