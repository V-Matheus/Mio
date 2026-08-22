import type { ComponentProps } from "react"
import { cn } from "@/shared/utils"

export type FilterGroupListProps = ComponentProps<"div">

export function FilterGroupList({
  className,
  children,
  ...props
}: FilterGroupListProps) {
  return (
    <div
      data-slot="filter-group-list"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}
