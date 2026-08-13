import { redirect } from "next/navigation"

interface StudioLessonPageProps {
  params: Promise<{
    slug: string
    lessonSlug: string
  }>
}

export default async function StudioLessonPage({
  params,
}: StudioLessonPageProps) {
  const { slug } = await params
  redirect(`/studio/${slug}`)
}
