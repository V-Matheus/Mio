import { getCategories } from "@/lib/catalog/service"
import type { Category } from "@/lib/catalog/types"

export async function getCategoriesQuery(): Promise<Category[]> {
  return getCategories()
}
