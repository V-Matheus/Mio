import type { ComponentProps } from "react"

type InputAdornmentProps = ComponentProps<"button"> & {
  "aria-label": string
}

export function InputAdornment({
  type = "button",
  className = "",
  children,
  ...props
}: InputAdornmentProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center text-foreground/40 transition-colors hover:text-foreground ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
