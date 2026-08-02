"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import { useState } from "react"
import { Icon } from "@/components/icon"
import type { SectionDetail, SectionSummary } from "@/lib/catalog/types"
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
  const [activeSectionSlug, setActiveSectionSlug] = useState(
    currentSection?.slug ?? sections[0]?.slug ?? "",
  )

  const activeIndex = sections.findIndex((s) => s.slug === activeSectionSlug)
  const currentSectionMeta = sections[activeIndex] ?? sections[0]
  const completedCount = sections.filter((s) => s.completed).length
  const progressPercent = Math.round(
    (completedCount / (sections.length || 1)) * 100,
  )

  return (
    <div
      data-slot="lesson-player"
      className={cn(
        "flex flex-col gap-6 w-full max-w-6xl mx-auto pb-16",
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
            {/* Section Title */}
            <h2 className="font-display text-2xl font-bold text-foreground">
              {currentSection?.title ??
                currentSectionMeta?.title ??
                "Conteúdo da Seção"}
            </h2>

            {/* Video / Media Placeholder */}
            <div className="mt-6 flex h-64 w-full items-center justify-center rounded-xl bg-foreground/10 relative group overflow-hidden">
              <div className="size-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Icon icon="mdi:play" className="size-8 ml-1" />
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-medium text-white">
                Vídeo: Introdução às Tags
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-medium text-white">
                12:45
              </div>
            </div>

            {/* Section Content Markdown / Code Box */}
            <div className="mt-6 space-y-4 text-foreground/90 leading-relaxed text-base">
              {currentSection?.contentMarkdown ? (
                <div className="prose max-w-none text-foreground">
                  <p>{currentSection.contentMarkdown}</p>
                </div>
              ) : (
                <p>
                  Tags são os elementos básicos da estrutura do HTML. Elas dizem
                  ao navegador qual o tipo de conteúdo exibido.
                </p>
              )}

              {/* Styled Code Box matching Figma design */}
              <div className="mt-6 rounded-xl border border-amber-200/80 bg-[#F7F1E8] p-5 font-mono text-sm font-bold text-primary shadow-inner">
                <code>{"<h1>olá, Mundo!</h1>"}</code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-foreground/10">
              <button
                type="button"
                className="flex-1 rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-white shadow-[0_4px_0_#CC3300] hover:bg-orange-600 active:translate-y-0.5 transition-all"
              >
                Marcar como concluída
              </button>

              <button
                type="button"
                aria-label="Salvar nos favoritos"
                className="flex size-12 items-center justify-center rounded-xl border border-foreground/15 bg-white text-foreground hover:bg-foreground/5 transition-colors shadow-sm"
              >
                <Icon icon="lucide:book-open" className="size-5" />
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
                const isCompleted = section.completed

                return (
                  <button
                    key={section.slug}
                    type="button"
                    onClick={() => setActiveSectionSlug(section.slug)}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-xl p-3.5 text-left transition-all border",
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
                      <span className="text-xs text-foreground/60">
                        {section.kind === "EXERCISE"
                          ? "Desafio Prático"
                          : "12 min"}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* XP Reward Card */}
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-400 text-amber-900 shadow-sm">
                <Icon icon="mdi:trophy" className="size-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-amber-800">
                  Recompensa da aula
                </span>
                <span className="font-display text-lg font-extrabold text-amber-900">
                  +50 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
