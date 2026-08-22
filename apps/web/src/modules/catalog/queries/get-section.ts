import { getSection } from "@/modules/catalog/services"
import type { SectionDetail } from "@/modules/catalog/types"

export async function getSectionQuery(
  trackSlug: string,
  lessonSlug: string,
  sectionSlug: string,
): Promise<SectionDetail | null> {
  return getSection(trackSlug, lessonSlug, sectionSlug)
}
