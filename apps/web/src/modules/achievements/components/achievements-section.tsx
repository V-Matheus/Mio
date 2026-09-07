"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { loadMoreAchievementsAction } from "@/modules/achievements/actions"
import { AchievementCard } from "@/modules/achievements/components/achievement-card"
import type {
  UserAchievement,
  UserAchievementsPage,
} from "@/modules/achievements/types"
import { CardTitle, CardWrapper } from "@/shared/components/card"
import { Icon } from "@/shared/components/icon"
import { Modal } from "@/shared/components/modal"

const PAGE_LIMIT = 10
const PREVIEW_COUNT = 6

interface AchievementsSectionProps {
  initialPage: UserAchievementsPage
}

export function AchievementsSection({ initialPage }: AchievementsSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<UserAchievement[]>(initialPage.items)
  const [hasMore, setHasMore] = useState(
    initialPage.items.length < initialPage.total,
  )
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { total, unlockedTotal } = initialPage

  useEffect(() => {
    if (!isOpen || !hasMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isPending) return

        startTransition(async () => {
          const next = await loadMoreAchievementsAction(
            PAGE_LIMIT,
            items.length,
          )
          setItems((prev) => [...prev, ...next.items])
          setHasMore(items.length + next.items.length < next.total)
        })
      },
      { rootMargin: "200px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isOpen, hasMore, isPending, items.length])

  if (total === 0) {
    return null
  }

  const preview = [...items]
    .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
    .slice(0, PREVIEW_COUNT)

  return (
    <CardWrapper className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>Conquistas</CardTitle>
        <span className="text-xs font-semibold text-zinc-400">
          {unlockedTotal} de {total}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {preview.map((achievement) => (
          <div
            key={achievement.slug}
            title={
              achievement.unlocked
                ? achievement.title
                : `${achievement.title} (bloqueada)`
            }
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${
              achievement.unlocked
                ? "border-amber-300 bg-amber-100 text-amber-600"
                : "border-zinc-200 bg-zinc-100 text-zinc-400 grayscale"
            }`}
          >
            <Icon icon="lucide:medal" width={18} height={18} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-sm font-semibold text-primary hover:underline"
      >
        Ver todas as conquistas
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Conquistas"
        description={`${unlockedTotal} de ${total} desbloqueadas`}
        containerClassName="!max-w-2xl"
      >
        <div className="mt-4 grid max-h-[60vh] w-full grid-cols-2 gap-3 overflow-y-auto pr-1">
          {items.map((achievement) => (
            <AchievementCard key={achievement.slug} achievement={achievement} />
          ))}

          {hasMore && (
            <div
              ref={sentinelRef}
              className="col-span-2 flex items-center justify-center py-3"
            >
              <Icon
                icon="mdi:update"
                width={20}
                height={20}
                className="animate-spin text-zinc-400"
              />
            </div>
          )}
        </div>
      </Modal>
    </CardWrapper>
  )
}
