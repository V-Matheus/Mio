import type { ComponentProps } from "react"

interface ButtonIconProps extends ComponentProps<"span"> {
  size?: number
}

export function ButtonIcon({
  size = 24,
  className = "",
  children,
  ...props
}: ButtonIconProps) {
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
