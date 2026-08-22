import type { ComponentProps } from "react"

type CardVariant = "default" | "reward" | "active"

interface CardWrapperProps extends ComponentProps<"div"> {
  variant?: CardVariant
}

const baseStyles = "rounded-2xl transition-all"

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white p-6 shadow-sm border border-gray-100",
  reward:
    "bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-4",
  active:
    "bg-background p-5 border-2 border-primary rounded-xl flex items-center gap-4",
}

export function CardWrapper({
  variant = "default",
  className = "",
  children,
  ...props
}: CardWrapperProps) {
  const classes = [baseStyles, variantStyles[variant], className]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
