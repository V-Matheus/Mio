import type { ReactNode } from "react"
import { FilterGroupItem } from "./filter-group-item"
import { FilterGroupLabel } from "./filter-group-label"
import { FilterGroupList } from "./filter-group-list"
import {
  FilterGroupWrapper,
  type FilterGroupWrapperProps,
} from "./filter-group-wrapper"

export type FilterGroupObjectItem = {
  label: string
  value: string
  color?: string
}

export type FilterGroupItemType = string | FilterGroupObjectItem

export interface FilterGroupProps
  extends Omit<FilterGroupWrapperProps, "onSelect"> {
  label: string
  icon?: ReactNode
  items: FilterGroupItemType[]
  selectedItem: string
  onSelect: (item: string) => void
}

export function FilterGroup({
  label,
  icon,
  items,
  selectedItem,
  onSelect,
  className,
  ...props
}: FilterGroupProps) {
  return (
    <FilterGroupWrapper className={className} {...props}>
      <FilterGroupLabel>
        {icon}
        {label}
      </FilterGroupLabel>
      <FilterGroupList>
        {items.map((item) => {
          const isString = typeof item === "string"
          const value = isString ? item : item.value
          const displayLabel = isString ? item : item.label
          const color = isString ? undefined : item.color
          const isSelected =
            value === selectedItem || displayLabel === selectedItem

          return (
            <FilterGroupItem
              key={value}
              selected={isSelected}
              color={color}
              onClick={() => onSelect(displayLabel)}
            >
              {displayLabel}
            </FilterGroupItem>
          )
        })}
      </FilterGroupList>
    </FilterGroupWrapper>
  )
}
