import { notFound } from "next/navigation"
import { MarkdownEditorClient } from "@/modules/studio/components/markdown-editor-client"
import { getStudioTrackQuery } from "@/modules/studio/queries/get-track"

interface StudioMarkdownEditorViewProps {
  trackSlug: string
  lessonSlug: string
  sectionSlug: string
}

export async function StudioMarkdownEditorView({
  trackSlug,
  lessonSlug,
  sectionSlug,
}: StudioMarkdownEditorViewProps) {
  const result = await getStudioTrackQuery(trackSlug)
  if (!result.ok || !result.track) {
    notFound()
  }

  const lesson = result.track.lessons.find((l) => l.slug === lessonSlug)
  if (!lesson) {
    notFound()
  }

  const section = lesson.sections.find((s) => s.slug === sectionSlug)
  if (!section) {
    notFound()
  }

  return (
    <MarkdownEditorClient
      lessonId={lesson.id}
      trackSlug={trackSlug}
      lessonSlug={lessonSlug}
      section={section}
    />
  )
}
