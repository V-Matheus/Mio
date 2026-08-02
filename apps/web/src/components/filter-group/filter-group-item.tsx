import type { ComponentProps } from "react"
import { cn } from "@/utils"

export interface FilterGroupItemProps extends ComponentProps<"button"> {
  selected?: boolean
  color?: string
}

export function FilterGroupItem({
  selected = false,
  color,
  className,
  children,
  style,
  ...props
}: FilterGroupItemProps) {
  const dynamicStyle =
    selected && color
      ? {
          backgroundColor: color,
          color: "#ffffff",
          borderColor: "transparent",
          ...style,
        }
      : style

  return (
    <button
      type="button"
      data-slot="filter-group-item"
      data-selected={selected ? "" : undefined}
      style={dynamicStyle}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:translate-y-0.5 cursor-pointer select-none",
        selected
          ? color
            ? "shadow-sm"
            : "bg-primary text-white shadow-sm"
          : "border border-foreground/10 bg-surface text-foreground/80 hover:bg-foreground/5",
        className,
      )}
      {...props}
    >
      {!selected && color && (
        <span
          className="size-2.5 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  )
}
