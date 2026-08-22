import type { ComponentProps } from "react"

interface InputWrapperProps extends ComponentProps<"div"> {}

export function InputWrapper({
  className = "",
  children,
  ...props
}: InputWrapperProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
