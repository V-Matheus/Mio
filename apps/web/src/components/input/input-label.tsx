import type { ComponentProps } from "react"

type InputLabelProps = ComponentProps<"label"> & {
  htmlFor: string
}

export function InputLabel({
  htmlFor,
  className = "",
  children,
  ...props
}: InputLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-semibold text-foreground ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
