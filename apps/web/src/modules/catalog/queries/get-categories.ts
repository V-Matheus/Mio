import { getCategories } from "@/modules/catalog/services"
import type { Category } from "@/modules/catalog/types"

export async function getCategoriesQuery(): Promise<Category[]> {
  return getCategories()
}
