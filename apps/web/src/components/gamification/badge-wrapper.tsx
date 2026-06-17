import type { ComponentProps } from "react"

interface BadgeWrapperProps extends ComponentProps<"div"> {}

const baseStyles =
  "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2"

export function BadgeWrapper({
  className = "",
  children,
  ...props
}: BadgeWrapperProps) {
  const classes = [baseStyles, className].filter(Boolean).join(" ")

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
