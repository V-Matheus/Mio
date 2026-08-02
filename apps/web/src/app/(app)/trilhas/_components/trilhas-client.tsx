"use client"

import { useState } from "react"
import {
  FilterGroup,
  type FilterGroupItemType,
} from "@/components/filter-group"
import { Icon } from "@/components/icon"
import {
  InputAdornment,
  InputControl,
  InputField,
  InputWrapper,
} from "@/components/input"
import type { Category, TrackSummary } from "@/lib/catalog/types"
import { TrackCard } from "./track-card"

export interface TrilhasClientProps {
  initialTracks: TrackSummary[]
  categories?: Category[]
}

export function TrilhasClient({
  initialTracks,
  categories = [],
}: TrilhasClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const availableCategories = categories

  const filterGroupItems: FilterGroupItemType[] = [
    "Todos",
    ...availableCategories.map((c) => ({
      label: c.name,
      value: c.name,
      color: c.color,
    })),
  ]

  const filteredTracks = initialTracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "Todos" ||
      track.category?.name.toLowerCase() === selectedCategory.toLowerCase() ||
      track.category?.slug.toLowerCase() ===
        selectedCategory.toLowerCase().replace(/\s+/g, "-") ||
      track.category?.id === selectedCategory ||
      track.slug
        .toLowerCase()
        .includes(selectedCategory.toLowerCase().replace(/\s+/g, "")) ||
      track.title.toLowerCase().includes(selectedCategory.toLowerCase())

    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
          Todas as Trilhas
        </h1>
        <p className="mt-1 text-base text-foreground/70">
          Explore nossa biblioteca completa de trilhas e expanda suas
          habilidades
        </p>
      </div>

      {/* Filter and Search Box using Design System Inputs */}
      <div className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
        {/* Search Input using Design System InputField / InputControl / InputAdornment */}
        <InputWrapper>
          <InputField>
            <InputAdornment aria-label="Buscar trilhas">
              <Icon
                icon="lucide:search"
                width={20}
                height={20}
                className="text-foreground/40"
              />
            </InputAdornment>
            <InputControl
              placeholder="Buscar trilhas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputField>
        </InputWrapper>

        {/* Reusable Global Category FilterGroup with dynamic Category Colors */}
        <FilterGroup
          label="Categoria"
          icon={<Icon icon="lucide:feather" className="size-3.5" />}
          items={filterGroupItems}
          selectedItem={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Grid Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground/70">
          Mostrando {filteredTracks.length}{" "}
          {filteredTracks.length === 1 ? "trilha" : "trilhas"}
        </span>
      </div>

      {/* Tracks Grid */}
      {filteredTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-foreground/20 p-12 text-center">
          <p className="text-base font-medium text-foreground/60">
            Nenhuma trilha encontrada para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTracks.map((track) => (
            <TrackCard
              key={track.slug}
              slug={track.slug}
              title={track.title}
              description={track.description}
              category={track.category}
              lessonCount={track.lessonCount}
              enrolled={track.enrolled}
            />
          ))}
        </div>
      )}
    </div>
  )
}
