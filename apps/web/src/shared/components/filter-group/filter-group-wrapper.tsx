import type { ComponentProps } from "react"
import { cn } from "@/shared/utils"

export type FilterGroupWrapperProps = ComponentProps<"div">

export function FilterGroupWrapper({
  className,
  children,
  ...props
}: FilterGroupWrapperProps) {
  return (
    <div
      data-slot="filter-group"
      className={cn("flex flex-col gap-2 pt-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}
