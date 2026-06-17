import type { ComponentProps } from "react"

interface InputControlProps extends ComponentProps<"input"> {}

export function InputControl({ className = "", ...props }: InputControlProps) {
  return (
    <input
      className={`flex-1 min-w-0 bg-transparent text-base text-foreground placeholder:text-foreground/40 outline-none ${className}`}
      {...props}
    />
  )
}
