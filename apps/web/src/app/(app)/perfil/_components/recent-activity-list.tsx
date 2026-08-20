import { CardWrapper } from "@/components/card"
import { Icon } from "@/components/icon"
import type { RecentActivityEntry } from "@/lib/profile/types"
import { formatRelativeTime } from "@/utils"

interface RecentActivityListProps {
  activities: RecentActivityEntry[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <CardWrapper className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Icon
          icon="lucide:clock"
          width={18}
          height={18}
          className="text-primary"
        />
        <h2 className="font-display font-bold text-lg text-foreground tracking-tight">
          Histórico Recente
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-foreground/40 mb-3">
            <Icon icon="lucide:clock" width={24} height={24} />
          </div>
          <p className="font-medium text-foreground text-sm">
            Nenhuma atividade recente
          </p>
          <p className="text-foreground/50 text-xs mt-1 max-w-xs">
            Complete lições e desafios para registrar suas conquistas aqui no
            seu histórico!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {activities.map((activity) => (
            <div
              key={`${activity.lessonId}-${activity.completedAt}`}
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
                  <Icon icon="lucide:check" width={16} height={16} />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-foreground text-sm truncate">
                    {activity.lessonTitle}
                  </p>
                  <p className="text-foreground/50 text-xs truncate">
                    {activity.trackTitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center pl-3">
                <span className="text-foreground/40 text-xs whitespace-nowrap">
                  {formatRelativeTime(activity.completedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardWrapper>
  )
}
