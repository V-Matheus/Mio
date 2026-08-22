"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { WeeklyXpSummary } from "@/modules/profile/types"
import { CardWrapper } from "@/shared/components/card"
import { Icon } from "@/shared/components/icon"
import { formatNumber } from "@/shared/utils"

interface WeeklyActivityProps {
  weeklyXp: WeeklyXpSummary
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    const xp = payload[0]?.value ?? 0
    return (
      <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-2 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium text-foreground/70 text-xs">{label}</p>
        <p className="font-mono font-bold text-primary text-xs">
          +{formatNumber(xp)} XP
        </p>
      </div>
    )
  }
  return null
}

export function WeeklyActivity({ weeklyXp }: WeeklyActivityProps) {
  const { days, totalWeeklyXp } = weeklyXp

  // Calcula escala dinâmica para o eixo Y semelhante à referência do Figma (0, 80, 160, 240, 320)
  const maxXp = Math.max(...days.map((d) => d.xp), 100)
  const step = Math.ceil(maxXp / 4 / 20) * 20 || 80
  const yMax = step * 4
  const yTicks = [0, step, step * 2, step * 3, step * 4]

  return (
    <CardWrapper className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon
            icon="lucide:trending-up"
            width={20}
            height={20}
            className="text-primary"
          />
          <h2 className="font-display font-bold text-lg text-foreground tracking-tight">
            Atividade da Semana
          </h2>
        </div>

        <span className="font-medium text-foreground/60 text-xs sm:text-sm">
          +{formatNumber(totalWeeklyXp)} XP esta semana
        </span>
      </div>

      {/* Gráfico de Área Suave (Spline Area Chart) com Recharts */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={days}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="weeklyXpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9100" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ff9100" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200/80 dark:text-zinc-800/80"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-foreground/50 font-medium"
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, yMax]}
              ticks={yTicks}
              tick={{ fontSize: 11 }}
              className="text-foreground/40 font-mono"
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="xp"
              stroke="#ff9100"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#weeklyXpGradient)"
              activeDot={{
                r: 6,
                fill: "#ff9100",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  )
}
