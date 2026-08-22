import type { ComponentProps } from "react"

interface BadgeValueProps extends ComponentProps<"span"> {}

export function BadgeValue({
  className = "",
  children,
  ...props
}: BadgeValueProps) {
  return (
    <span
      className={`text-sm font-bold font-display text-foreground leading-none ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
