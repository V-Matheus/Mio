import { LessonView } from "@/modules/progress"

interface LessonDetailPageProps {
  params: Promise<{
    slug: string
    lessonSlug: string
  }>
  searchParams: Promise<{
    section?: string
  }>
}

export default async function LessonDetailPage({
  params,
  searchParams,
}: LessonDetailPageProps) {
  const { slug: trackSlug, lessonSlug } = await params
  const { section: sectionSlug } = await searchParams

  return (
    <LessonView
      trackSlug={trackSlug}
      lessonSlug={lessonSlug}
      sectionSlug={sectionSlug}
    />
  )
}
