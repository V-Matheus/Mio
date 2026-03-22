import type { ComponentProps } from "react"

type ButtonVariant = "primary" | "secondary" | "outline" | "icon"
type ButtonColorScheme = "primary" | "success" | "disabled"

type ButtonWrapperBaseProps = ComponentProps<"button"> & {
  colorScheme?: ButtonColorScheme
}

type ButtonWrapperProps =
  | (ButtonWrapperBaseProps & { variant?: "primary" | "secondary" | "outline" })
  | (ButtonWrapperBaseProps & { variant: "icon"; "aria-label": string })

const baseStyles =
  "inline-flex items-center justify-center font-display font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "rounded-full px-10 py-4 bg-primary text-white shadow-[0_6px_0_var(--color-primary-shadow)] active:translate-y-[3px] active:shadow-[0_3px_0_var(--color-primary-shadow)] disabled:active:translate-y-0 disabled:active:shadow-[0_6px_0_var(--color-primary-shadow)]",
  secondary:
    "rounded-full px-10 py-4 bg-white text-foreground border-[3px] border-foreground",
  outline:
    "rounded-full px-10 py-4 bg-transparent text-white border-[3px] border-white hover:bg-white/10",
  icon: "rounded-2xl p-4 shadow-[0_6px_0_var(--shadow-color)] active:translate-y-[3px] active:shadow-[0_3px_0_var(--shadow-color)] disabled:active:translate-y-0 disabled:active:shadow-[0_6px_0_var(--shadow-color)] disabled:cursor-not-allowed",
}

const iconColorStyles: Record<ButtonColorScheme, string> = {
  primary: "bg-primary text-white [--shadow-color:#CC3300]",
  success: "bg-success text-white [--shadow-color:#0A8C62]",
  disabled:
    "bg-disabled text-disabled-foreground [--shadow-color:#B0B0B0] cursor-not-allowed",
}

export function ButtonWrapper({
  variant = "primary",
  colorScheme = "primary",
  className = "",
  children,
  ...props
}: ButtonWrapperProps) {
  const classes = [
    baseStyles,
    variantStyles[variant],
    variant === "icon" ? iconColorStyles[colorScheme] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const isDisabled = colorScheme === "disabled" || props.disabled

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {children}
    </button>
  )
}
