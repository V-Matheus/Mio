import { StudioMarkdownEditorView } from "@/modules/studio"

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

  return (
    <StudioMarkdownEditorView
      trackSlug={slug}
      lessonSlug={lessonSlug}
      sectionSlug={sectionSlug}
    />
  )
}
