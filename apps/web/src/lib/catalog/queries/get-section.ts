import { getSection } from "@/lib/catalog/service"
import type { SectionDetail } from "@/lib/catalog/types"

export async function getSectionQuery(
  trackSlug: string,
  lessonSlug: string,
  sectionSlug: string,
): Promise<SectionDetail | null> {
  return getSection(trackSlug, lessonSlug, sectionSlug)
}
