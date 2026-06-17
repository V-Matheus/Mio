import type { ComponentProps } from "react"

interface CardDescriptionProps extends ComponentProps<"span"> {}

export function CardDescription({
  className = "",
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <span
      className={`text-lg font-bold font-display text-foreground leading-tight ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
