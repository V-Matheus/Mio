import type { ComponentProps } from "react"

type CardIconColorScheme = "primary" | "primary-solid" | "success" | "secondary"

interface CardIconProps extends ComponentProps<"span"> {
  size?: number
  colorScheme?: CardIconColorScheme
}

const colorSchemeStyles: Record<CardIconColorScheme, string> = {
  primary: "bg-primary/10 text-primary rounded-xl",
  "primary-solid": "bg-primary text-white rounded-full",
  success: "bg-success/10 text-success rounded-xl",
  secondary: "bg-secondary/10 text-secondary rounded-xl",
}

export function CardIcon({
  size = 40,
  colorScheme = "primary",
  className = "",
  children,
  ...props
}: CardIconProps) {
  const classes = [
    "inline-flex items-center justify-center",
    colorSchemeStyles[colorScheme],
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <span className={classes} style={{ width: size, height: size }} {...props}>
      {children}
    </span>
  )
}
