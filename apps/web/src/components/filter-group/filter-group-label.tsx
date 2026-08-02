import type { ComponentProps } from "react"
import { cn } from "@/utils"

export type FilterGroupLabelProps = ComponentProps<"span">

export function FilterGroupLabel({
  className,
  children,
  ...props
}: FilterGroupLabelProps) {
  return (
    <span
      data-slot="filter-group-label"
      className={cn(
        "flex items-center gap-1.5 text-xs font-bold text-foreground/60 uppercase tracking-wider",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
