import { notFound } from "next/navigation"
import { studioService } from "@/lib/studio/service"
import { MarkdownEditorClient } from "./_components/markdown-editor-client"

interface MarkdownEditorPageProps {
  params: Promise<{
    slug: string
    lessonSlug: string
    sectionSlug: string
  }>
}

export default async function MarkdownEditorPage({
  params,
}: MarkdownEditorPageProps) {
  const { slug, lessonSlug, sectionSlug } = await params

  const result = await studioService.getTrack(slug)
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
      trackSlug={slug}
      lessonSlug={lessonSlug}
      section={section}
    />
  )
}
