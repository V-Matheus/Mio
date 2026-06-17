import type { ComponentProps } from "react"

interface CardTitleProps extends ComponentProps<"span"> {}

export function CardTitle({
  className = "",
  children,
  ...props
}: CardTitleProps) {
  return (
    <span
      className={`text-sm font-semibold text-foreground leading-tight ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
