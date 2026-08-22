import type { ComponentProps } from "react"

interface ButtonTextProps extends ComponentProps<"span"> {}

export function ButtonText({
  className = "",
  children,
  ...props
}: ButtonTextProps) {
  return (
    <span className={`text-xl leading-none ${className}`} {...props}>
      {children}
    </span>
  )
}
