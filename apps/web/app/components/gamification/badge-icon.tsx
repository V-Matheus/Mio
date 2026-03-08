import type { ComponentProps } from "react"

interface BadgeIconProps extends ComponentProps<"span"> {
  size?: number
}

export function BadgeIcon({
  size = 20,
  className = "",
  children,
  ...props
}: BadgeIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {children}
    </span>
  )
}
