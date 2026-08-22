import Link from "next/link"
import type { ComponentProps } from "react"
import type { Category } from "@/modules/catalog/types"
import { Icon } from "@/shared/components/icon"
import { cn } from "@/shared/utils"

export interface TrackCardProps extends ComponentProps<"div"> {
  slug: string
  title: string
  description?: string | null
  category?: Category | null
  lessonCount: number
  enrolled?: boolean
  studentCount?: number
  rating?: number
}

export function TrackCard({
  slug,
  title,
  description,
  category,
  lessonCount,
  enrolled = false,
  studentCount = 15420,
  rating = 4.8,
  className,
  ...props
}: TrackCardProps) {
  return (
    <div
      data-slot="track-card"
      className={cn(
        "group flex flex-col justify-between overflow-hidden rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        className,
      )}
      {...props}
    >
      <div>
        {/* Category & Enrolled Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {category ? (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          ) : (
            <span />
          )}

          {enrolled && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <Icon
                icon="mdi:check-circle"
                className="size-3.5 text-emerald-600"
              />
              Matriculado
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
          {description ??
            "Aprenda com lições práticas e exercícios interativos."}
        </p>

        {/* Stats Grid */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 text-xs font-medium text-foreground/60 border-t border-foreground/5 pt-3">
          <span className="flex items-center gap-1">
            <Icon
              icon="lucide:book-open"
              className="size-4 text-foreground/50"
            />
            {lessonCount} aulas
          </span>
          <span className="flex items-center gap-1">
            <Icon
              icon="mdi:account-group-outline"
              className="size-4 text-foreground/50"
            />
            {studentCount.toLocaleString("pt-BR")} alunos
          </span>
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Icon
              icon="mdi:star"
              className="size-4 fill-amber-400 text-amber-400"
            />
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-6">
        <Link
          href={`/trilhas/${slug}`}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all shadow-sm active:translate-y-0.5",
            enrolled
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_0_#0A8C62]"
              : "bg-primary hover:bg-orange-600 shadow-[0_4px_0_#CC3300]",
          )}
        >
          {enrolled ? "Continuar Trilha" : "Ver Trilha"}
        </Link>
      </div>
    </div>
  )
}
