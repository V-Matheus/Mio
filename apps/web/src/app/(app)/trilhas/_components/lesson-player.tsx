"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { useEffect, useState, useTransition } from "react"
import { Icon } from "@/components/icon"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Modal } from "@/components/modal"
import { getSectionAction } from "@/lib/catalog/actions"
import type { SectionDetail, SectionSummary } from "@/lib/catalog/types"
import { markSectionViewedAction } from "@/lib/progress/actions"
import { cn } from "@/utils"

export interface LessonPlayerProps extends ComponentProps<"div"> {
  trackSlug: string
  lessonSlug: string
  lessonTitle: string
  sections: SectionSummary[]
  currentSection?: SectionDetail | null
  className?: string
}

export function LessonPlayer({
  trackSlug,
  lessonSlug,
  lessonTitle,
  sections,
  currentSection,
  className,
  ...props
}: LessonPlayerProps) {
  const router = useRouter()
  const [activeSectionSlug, setActiveSectionSlug] = useState(
    currentSection?.slug ?? sections[0]?.slug ?? "",
  )
  const [sectionsMap, setSectionsMap] = useState<Record<string, SectionDetail>>(
    () => (currentSection ? { [currentSection.slug]: currentSection } : {}),
  )
  const [viewedSectionIds, setViewedSectionIds] = useState<Set<number>>(
    () => new Set(sections.filter((s) => s.completed).map((s) => s.id)),
  )
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (currentSection) {
      setSectionsMap((prev) => ({
        ...prev,
        [currentSection.slug]: currentSection,
      }))
    }
  }, [currentSection])

  const activeIndex = sections.findIndex((s) => s.slug === activeSectionSlug)
  const currentSectionMeta = sections[activeIndex] ?? sections[0]
  const activeSectionDetail = activeSectionSlug
    ? sectionsMap[activeSectionSlug]
    : null

  const isLastSection = activeIndex === sections.length - 1
  const isCurrentSectionViewed = currentSectionMeta
    ? viewedSectionIds.has(currentSectionMeta.id)
    : false

  const completedCount = viewedSectionIds.size
  const progressPercent = Math.round(
    (completedCount / (sections.length || 1)) * 100,
  )

  const handleSelectSection = (targetSlug: string) => {
    setActiveSectionSlug(targetSlug)
    router.replace(
      `/trilhas/${trackSlug}/aula/${lessonSlug}?section=${targetSlug}`,
      { scroll: false },
    )

    if (!sectionsMap[targetSlug]) {
      startTransition(async () => {
        const fetched = await getSectionAction(
          trackSlug,
          lessonSlug,
          targetSlug,
        )
        if (fetched) {
          setSectionsMap((prev) => ({ ...prev, [targetSlug]: fetched }))
        }
      })
    }
  }

  const handleMarkSectionDone = () => {
    if (!currentSectionMeta) return

    const isLessonFullyCompleted =
      sections.length > 0 && sections.every((s) => viewedSectionIds.has(s.id))

    if (isCurrentSectionViewed && (isLastSection || isLessonFullyCompleted)) {
      router.push(`/trilhas/${trackSlug}`)
      return
    }

    startTransition(async () => {
      const res = await markSectionViewedAction(
        currentSectionMeta.id,
        trackSlug,
        lessonSlug,
      )

      setViewedSectionIds((prev) => {
        const next = new Set(prev)
        next.add(currentSectionMeta.id)
        return next
      })

      if (res.lessonCompleted) {
        setShowCompletionModal(true)
      } else if (activeIndex < sections.length - 1) {
        const nextSection = sections[activeIndex + 1]
        if (nextSection) {
          handleSelectSection(nextSection.slug)
        }
      } else {
        router.push(`/trilhas/${trackSlug}`)
      }
    })
  }

  return (
    <div
      data-slot="lesson-player"
      className={cn(
        "flex flex-col gap-6 w-full max-w-6xl mx-auto pb-16 relative",
        className,
      )}
      {...props}
    >
      {/* Top Header Navigation */}
      <div>
        <Link
          href={`/trilhas/${trackSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-orange-600 transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="size-4" />
          Voltar para a Trilha
        </Link>

        <h1 className="mt-3 font-display text-3xl font-extrabold text-foreground md:text-4xl">
          {lessonTitle}
        </h1>
        <p className="mt-1 text-sm text-foreground/70">
          Nessa aula vamos aprender os conceitos fundamentais para praticar e
          evoluir.
        </p>

        {/* Progress Bar */}
        <div className="mt-4 flex flex-col gap-1.5 max-w-xl">
          <div className="flex items-center justify-between text-xs font-bold text-foreground/80">
            <span>Progresso da aula</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-foreground/10 p-0.5">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 shadow-[0_2px_0_#CC3300]"
              style={{ width: `${Math.max(progressPercent, 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Content (Left) + Sidebar (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Lesson Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Card */}
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white p-6 md:p-8 shadow-sm">
            {/* Section Content Markdown */}
            <div className="mt-6">
              <MarkdownRenderer
                content={activeSectionDetail?.contentMarkdown}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-foreground/10">
              <button
                type="button"
                onClick={handleMarkSectionDone}
                disabled={isPending}
                className={cn(
                  "flex-1 rounded-xl py-3.5 text-center text-sm font-bold text-white transition-all active:translate-y-0.5",
                  isCurrentSectionViewed
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_0_#047857]"
                    : "bg-primary hover:bg-orange-600 shadow-[0_4px_0_#CC3300]",
                  isPending && "opacity-60 cursor-not-allowed",
                )}
              >
                {isPending
                  ? "Salvando..."
                  : isLastSection
                    ? isCurrentSectionViewed
                      ? "Voltar para a Trilha"
                      : "Concluir aula"
                    : isCurrentSectionViewed
                      ? "Próxima seção"
                      : "Marcar como vista e avançar"}
              </button>

              <button
                type="button"
                onClick={() => setIsBookmarked((prev) => !prev)}
                aria-label={
                  isBookmarked
                    ? "Remover dos favoritos"
                    : "Salvar nos favoritos"
                }
                title={
                  isBookmarked
                    ? "Remover dos favoritos"
                    : "Salvar nos favoritos"
                }
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl border transition-all shadow-sm cursor-pointer",
                  isBookmarked
                    ? "border-amber-300 bg-amber-50 text-amber-600"
                    : "border-foreground/15 bg-white text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <Icon
                  icon={isBookmarked ? "mdi:bookmark" : "mdi:bookmark-outline"}
                  className="size-5"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Course Contents Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
              <Icon icon="lucide:book-open" className="size-5 text-primary" />
              Conteúdo do curso
            </h3>

            {/* Sections List */}
            <div className="flex flex-col gap-3">
              {sections.map((section, idx) => {
                const isActive = section.slug === activeSectionSlug
                const isCompleted = viewedSectionIds.has(section.id)

                return (
                  <button
                    key={section.slug}
                    type="button"
                    onClick={() => handleSelectSection(section.slug)}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-xl p-3.5 text-left transition-all border cursor-pointer",
                      isActive
                        ? "border-primary bg-orange-50/70 shadow-sm"
                        : "border-foreground/10 bg-surface hover:bg-foreground/5",
                    )}
                  >
                    {/* Badge Icon / Number */}
                    {isCompleted ? (
                      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Icon icon="mdi:check" className="size-5" />
                      </div>
                    ) : isActive ? (
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-white shadow-sm">
                        {idx + 1}
                      </div>
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-foreground/10 font-bold text-foreground/60">
                        {idx + 1}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex-1">
                      <span
                        className={cn(
                          "block text-sm font-bold",
                          isActive ? "text-primary" : "text-foreground",
                        )}
                      >
                        {section.title}
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        ⚡ 50 XP
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global Modal Component for Completion Prompt */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        closeOnOverlayClick={true}
        showCloseButton={true}
      >
        <div className="flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-500 shadow-inner">
          <Icon icon="mdi:trophy" className="size-12 animate-bounce" />
        </div>

        <h3 className="mt-4 font-display text-2xl font-extrabold text-foreground">
          Aula Concluída! 🎉
        </h3>

        <p className="mt-2 text-sm text-foreground/70">
          Você completou todas as seções desta aula. Seus XP e conquistas estão
          a caminho!
        </p>

        <div className="mt-6 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowCompletionModal(false)}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-[0_4px_0_#CC3300] hover:bg-orange-600 transition-all cursor-pointer"
          >
            Continuar aprendendo
          </button>

          <Link
            href={`/trilhas/${trackSlug}`}
            className="w-full rounded-xl border border-foreground/15 py-3 text-center text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors"
          >
            Voltar para a Trilha
          </Link>
        </div>
      </Modal>
    </div>
  )
}
