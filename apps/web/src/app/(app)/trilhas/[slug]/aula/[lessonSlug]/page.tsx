import { notFound } from "next/navigation"
import { LessonPlayer } from "@/app/(app)/trilhas/_components/lesson-player"
import { getLessonQuery, getSectionQuery } from "@/lib/catalog/queries"

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>
  searchParams: Promise<{ section?: string }>
}

export default async function LessonDetailPage({
  params,
  searchParams,
}: LessonPageProps) {
  const { slug: trackSlug, lessonSlug } = await params
  const { section: sectionSlugParam } = await searchParams

  const lesson = await getLessonQuery(trackSlug, lessonSlug)

  if (!lesson) {
    notFound()
  }

  const activeSectionSlug = sectionSlugParam ?? lesson.sections[0]?.slug ?? ""

  const section = activeSectionSlug
    ? await getSectionQuery(trackSlug, lessonSlug, activeSectionSlug).catch(
        () => null,
      )
    : null

  return (
    <div className="w-full pt-4">
      <LessonPlayer
        trackSlug={trackSlug}
        lessonSlug={lessonSlug}
        lessonTitle={lesson.title}
        sections={lesson.sections}
        currentSection={section}
      />
    </div>
  )
}
