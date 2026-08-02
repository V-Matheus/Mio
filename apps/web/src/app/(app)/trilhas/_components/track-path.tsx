"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import { useTransition } from "react"
import { Icon } from "@/components/icon"
import { enrollInTrackAction } from "@/lib/catalog/actions"
import type { LessonSummary } from "@/lib/catalog/types"
import { cn } from "@/utils"

export interface TrackPathProps extends ComponentProps<"div"> {
  trackId: number
  trackSlug: string
  trackTitle: string
  trackDescription?: string | null
  lessons: LessonSummary[]
  enrolled: boolean
  streakCount?: number
  totalXp?: number
}

export function TrackPath({
  trackId,
  trackSlug,
  trackTitle,
  trackDescription,
  lessons,
  enrolled,
  streakCount = 12,
  totalXp = 1500,
  className,
  ...props
}: TrackPathProps) {
  const [isPending, startTransition] = useTransition()

  const activeLessonIndex = lessons.findIndex((lesson) => !lesson.completed)
  const currentIndex =
    activeLessonIndex === -1 ? lessons.length - 1 : activeLessonIndex

  const handleEnroll = () => {
    startTransition(async () => {
      await enrollInTrackAction(trackId, trackSlug)
    })
  }

  return (
    <div
      data-slot="track-path"
      className={cn(
        "flex flex-col items-center w-full max-w-4xl mx-auto pb-16",
        className,
      )}
      {...props}
    >
      {/* Track Header Title */}
      <div className="text-center mb-6">
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
              onClick={handleEnroll}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-[0_4px_0_#CC3300] hover:bg-orange-600 active:translate-y-0.5 disabled:opacity-50 transition-all"
            >
              <Icon icon="mdi:check-circle" className="size-5" />
              {isPending ? "Matriculando..." : "Matricular-se nesta Trilha"}
            </button>
          </div>
        )}
      </div>

      {/* Gamification Stats Header Badges */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-2 text-sm font-bold text-orange-600 shadow-sm backdrop-blur-sm">
          <Icon
            icon="mdi:fire"
            className="size-5 fill-orange-500 text-orange-500"
          />
          <span>{streakCount}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-2 text-sm font-bold text-amber-600 shadow-sm backdrop-blur-sm">
          <Icon
            icon="mdi:trophy"
            className="size-5 fill-amber-500 text-amber-500"
          />
          <span>{totalXp} XP</span>
        </div>
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
                <div
                  className="flex size-16 items-center justify-center rounded-2xl bg-disabled text-disabled-foreground shadow-[0_4px_0_#B0B0B0] cursor-not-allowed"
                  title="Lição Bloqueada"
                >
                  <Icon icon="mdi:lock" className="size-8" />
                </div>
              ) : (
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
              )}

              {/* Lesson Title & XP Badge */}
              <div className="mt-3 text-center">
                <span className="block font-display text-sm font-bold text-foreground">
                  {lesson.title}
                </span>
                <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  ⚡ 50 XP
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
