"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { useState, useTransition } from "react"
import { enrollInTrackAction } from "@/modules/catalog/actions"
import type { LessonSummary } from "@/modules/catalog/types"
import { Icon } from "@/shared/components/icon"
import { Modal } from "@/shared/components/modal"
import { cn } from "@/shared/utils"

export interface TrackPathProps extends ComponentProps<"div"> {
  trackId: number
  trackSlug: string
  trackTitle: string
  trackDescription?: string | null
  lessons: LessonSummary[]
  enrolled: boolean
  autoOpenEnrollModal?: boolean
}

export function TrackPath({
  trackId,
  trackSlug,
  trackTitle,
  trackDescription,
  lessons,
  enrolled,
  autoOpenEnrollModal = false,
  className,
  ...props
}: TrackPathProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalMode, setModalMode] = useState<"ENROLL" | "LOCKED_LESSON">(
    "ENROLL",
  )
  const [showEnrollModal, setShowEnrollModal] = useState(
    () => autoOpenEnrollModal && !enrolled,
  )
  const [targetLessonSlug, setTargetLessonSlug] = useState<string | null>(null)

  const activeLessonIndex = lessons.findIndex((lesson) => !lesson.completed)
  const currentIndex =
    activeLessonIndex === -1 ? lessons.length - 1 : activeLessonIndex

  const targetLesson = lessons.find((l) => l.slug === targetLessonSlug)

  const handleEnrollConfirm = () => {
    startTransition(async () => {
      const res = await enrollInTrackAction(trackId, trackSlug)
      if (res.ok) {
        setShowEnrollModal(false)
        if (targetLessonSlug) {
          router.push(`/trilhas/${trackSlug}/aula/${targetLessonSlug}`)
        } else if (lessons[0]?.slug) {
          router.push(`/trilhas/${trackSlug}/aula/${lessons[0].slug}`)
        }
      }
    })
  }

  const handleLessonClick = (lessonSlug: string) => {
    if (enrolled) {
      router.push(`/trilhas/${trackSlug}/aula/${lessonSlug}`)
    } else {
      setModalMode("LOCKED_LESSON")
      setTargetLessonSlug(lessonSlug)
      setShowEnrollModal(true)
    }
  }

  return (
    <div
      data-slot="track-path"
      className={cn(
        "flex flex-col items-center w-full max-w-4xl mx-auto pb-16 relative",
        className,
      )}
      {...props}
    >
      {/* Track Header Title */}
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
          {trackTitle}
        </h1>
        {trackDescription && (
          <p className="mt-2 text-base text-foreground/70 font-medium max-w-xl mx-auto">
            {trackDescription}
          </p>
        )}

        {/* Enrollment CTA if not enrolled */}
        {!enrolled && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setModalMode("ENROLL")
                setTargetLessonSlug(lessons[0]?.slug ?? null)
                setShowEnrollModal(true)
              }}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-[0_4px_0_#CC3300] hover:bg-orange-600 active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Icon icon="mdi:check-circle" className="size-5" />
              Matricular-se nesta Trilha
            </button>
          </div>
        )}
      </div>

      {/* Path Nodes List */}
      <div className="relative flex flex-col items-center gap-12 w-full pt-4">
        {lessons.map((lesson, index) => {
          const isCompleted = lesson.completed
          const isActive = index === currentIndex && !isCompleted
          const isLocked = !isCompleted && !isActive

          const offsets = [
            "transform-none",
            "translate-x-12",
            "translate-x-24",
            "translate-x-12",
            "transform-none",
            "-translate-x-12",
            "-translate-x-24",
            "-translate-x-12",
          ]
          const offsetClass = offsets[index % offsets.length]

          return (
            <div
              key={lesson.slug}
              className={cn(
                "relative flex flex-col items-center group transition-transform duration-300",
                offsetClass,
              )}
            >
              {/* Vertical connector line */}
              {index < lessons.length - 1 && (
                <div
                  className={cn(
                    "absolute top-16 h-16 w-3 -z-10 rounded-full transition-colors",
                    isCompleted ? "bg-emerald-400" : "bg-foreground/15",
                  )}
                />
              )}

              {/* Speech bubble for active lesson */}
              {isActive && (
                <div className="absolute -top-12 z-20 animate-bounce">
                  <div className="relative flex items-center gap-1 rounded-2xl bg-white px-3.5 py-1.5 text-xs font-bold text-foreground shadow-md border border-foreground/10">
                    <span>Vamos lá! 🚀</span>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-white" />
                  </div>
                </div>
              )}

              {/* Node Button */}
              {isLocked ? (
                <button
                  type="button"
                  onClick={() => handleLessonClick(lesson.slug)}
                  className="flex size-16 items-center justify-center rounded-2xl bg-disabled text-disabled-foreground shadow-[0_4px_0_#B0B0B0] cursor-pointer hover:opacity-90 transition-opacity"
                  title={
                    enrolled
                      ? "Lição Bloqueada"
                      : "Matricule-se para desbloquear"
                  }
                >
                  <Icon icon="mdi:lock" className="size-8" />
                </button>
              ) : enrolled ? (
                <Link
                  href={`/trilhas/${trackSlug}/aula/${lesson.slug}`}
                  className={cn(
                    "relative flex size-16 items-center justify-center rounded-2xl text-white transition-all active:translate-y-1 shadow-md",
                    isCompleted &&
                      "bg-emerald-500 shadow-[0_4px_0_#0A8C62] hover:bg-emerald-600",
                    isActive &&
                      "bg-primary shadow-[0_4px_0_#CC3300] hover:bg-orange-600 ring-4 ring-orange-300/60 ring-offset-2 animate-pulse",
                  )}
                >
                  {isCompleted ? (
                    <Icon icon="mdi:check-bold" className="size-8 stroke-[3]" />
                  ) : (
                    <Icon icon="mdi:star" className="size-8 fill-white" />
                  )}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleLessonClick(lesson.slug)}
                  className={cn(
                    "relative flex size-16 items-center justify-center rounded-2xl text-white transition-all active:translate-y-1 shadow-md cursor-pointer",
                    isActive
                      ? "bg-primary shadow-[0_4px_0_#CC3300] hover:bg-orange-600 ring-4 ring-orange-300/60 ring-offset-2 animate-pulse"
                      : "bg-orange-400 shadow-[0_4px_0_#C25E00] hover:bg-orange-500",
                  )}
                >
                  <Icon icon="mdi:lock" className="size-8" />
                </button>
              )}

              {/* Lesson Title & XP Badge */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => handleLessonClick(lesson.slug)}
                  className="block font-display text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {lesson.title}
                </button>
                <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  ⚡ 50 XP
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Global Modal Component for Enrollment / Locked Lesson Prompt */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        closeOnOverlayClick={true}
        showCloseButton={true}
      >
        {modalMode === "ENROLL" ? (
          <>
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
              <Icon icon="lucide:graduation-cap" className="size-9" />
            </div>

            <h3 className="mt-4 font-display text-2xl font-extrabold text-foreground">
              Matricular-se na Trilha
            </h3>

            <p className="mt-2 text-sm text-foreground/70 leading-relaxed text-center">
              Você está prestes a iniciar a trilha{" "}
              <strong className="text-foreground">{trackTitle}</strong>.
            </p>

            <div className="mt-4 w-full space-y-2.5 rounded-2xl bg-amber-50/60 p-4 text-left border border-amber-200/60">
              <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                <Icon
                  icon="mdi:check-circle"
                  className="size-4 text-emerald-600 shrink-0"
                />
                <span>
                  Acesso liberado a todas as {lessons.length} aulas da trilha
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                <Icon
                  icon="lucide:zap"
                  className="size-4 text-amber-600 shrink-0"
                />
                <span>Ganho de XP e subida de posições no ranking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                <Icon
                  icon="lucide:target"
                  className="size-4 text-primary shrink-0"
                />
                <span>
                  Registro e acompanhamento de progresso no seu perfil
                </span>
              </div>
            </div>

            <div className="mt-6 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleEnrollConfirm}
                disabled={isPending}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_4px_0_#CC3300] hover:bg-orange-600 active:translate-y-0.5 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isPending
                  ? "Matriculando..."
                  : "Confirmar Matrícula e Começar 🚀"}
              </button>

              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="w-full rounded-xl border border-foreground/15 py-3 text-center text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
              >
                Depois
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shadow-inner">
              <Icon icon="mdi:lock-alert" className="size-9" />
            </div>

            <h3 className="mt-4 font-display text-2xl font-extrabold text-foreground">
              Aula Bloqueada
            </h3>

            <p className="mt-2 text-sm text-foreground/70 leading-relaxed text-center">
              A aula{" "}
              <strong className="text-foreground">
                {targetLesson?.title ?? "selecionada"}
              </strong>{" "}
              está disponível para alunos matriculados na trilha{" "}
              <strong className="text-foreground">{trackTitle}</strong>.
            </p>

            <p className="mt-1 text-xs text-foreground/50 text-center">
              Matricule-se para desbloquear todas as aulas e registrar seus
              pontos de XP!
            </p>

            <div className="mt-6 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleEnrollConfirm}
                disabled={isPending}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_4px_0_#CC3300] hover:bg-orange-600 active:translate-y-0.5 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isPending
                  ? "Matriculando..."
                  : "Matricular-se para Desbloquear 🔓"}
              </button>

              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="w-full rounded-xl border border-foreground/15 py-3 text-center text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
