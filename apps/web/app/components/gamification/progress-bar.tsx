import type { ComponentProps } from "react"

interface ProgressBarProps extends ComponentProps<"div"> {
  value: number
  max?: number
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const classes = [
    "h-4 w-full rounded-full bg-gray-200 overflow-hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
