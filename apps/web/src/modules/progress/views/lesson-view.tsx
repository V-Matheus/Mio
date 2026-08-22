import { redirect } from "next/navigation"
import { getLessonQuery, getSectionQuery } from "@/modules/catalog/queries"
import { LessonPlayer } from "@/modules/progress/components/lesson-player"

interface LessonViewProps {
  trackSlug: string
  lessonSlug: string
  sectionSlug?: string
}

export async function LessonView({
  trackSlug,
  lessonSlug,
  sectionSlug: sectionSlugParam,
}: LessonViewProps) {
  const lesson = await getLessonQuery(trackSlug, lessonSlug)

  if (!lesson) {
    redirect(`/trilhas/${trackSlug}?enroll=true`)
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
