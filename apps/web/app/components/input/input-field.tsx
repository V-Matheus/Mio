import type { ComponentProps } from "react"

type InputFieldColorScheme = "primary" | "success" | "disabled"

interface InputFieldProps extends ComponentProps<"div"> {
  colorScheme?: InputFieldColorScheme
}

const baseStyles =
  "flex items-center gap-3 rounded-full border-2 bg-white px-6 py-4 shadow-[0_3px_0_var(--shadow-color)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_var(--shadow-color)] focus-within:-translate-y-0.5 focus-within:border-[var(--field-color)] focus-within:shadow-[0_5px_0_var(--shadow-color)]"

const colorSchemeStyles: Record<InputFieldColorScheme, string> = {
  primary:
    "border-foreground/10 [--field-color:var(--color-primary)] [--shadow-color:rgba(51,45,40,0.08)] hover:border-primary/40 hover:[--shadow-color:var(--color-primary-shadow)] focus-within:[--shadow-color:var(--color-primary-shadow)]",
  success:
    "border-success/40 [--field-color:var(--color-success)] [--shadow-color:var(--color-success-shadow)]",
  disabled:
    "border-disabled bg-disabled/20 cursor-not-allowed pointer-events-none [--field-color:var(--color-disabled)] [--shadow-color:var(--color-disabled-shadow)]",
}

export function InputField({
  colorScheme = "primary",
  className = "",
  children,
  ...props
}: InputFieldProps) {
  const classes = [baseStyles, colorSchemeStyles[colorScheme], className]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
