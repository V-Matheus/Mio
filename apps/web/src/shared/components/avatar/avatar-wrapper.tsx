import type { ComponentProps } from "react"

type AvatarSize = "sm" | "md" | "lg" | "xl"

interface AvatarWrapperProps extends ComponentProps<"span"> {
  size?: AvatarSize
}

const baseStyles =
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary font-display font-bold select-none"

const sizeStyles: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-24 text-3xl",
}

export function AvatarWrapper({
  size = "md",
  className = "",
  children,
  ...props
}: AvatarWrapperProps) {
  const classes = [baseStyles, sizeStyles[size], className]
    .filter(Boolean)
    .join(" ")

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
