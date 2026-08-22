"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import {
  deleteLessonAction,
  deleteSectionAction,
  upsertLessonAction,
  upsertSectionAction,
} from "@/modules/studio/actions"
import type {
  AdminLessonSummary,
  AdminSectionSummary,
  AdminTrackDetail,
} from "@/modules/studio/types"
import { BadgeIcon, BadgeValue, BadgeWrapper } from "@/shared/components/badge"
import { ButtonText, ButtonWrapper } from "@/shared/components/button"
import { CardWrapper } from "@/shared/components/card/card-wrapper"
import { Icon } from "@/shared/components/icon"
import {
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/shared/components/input"

interface TrackDetailClientProps {
  track: AdminTrackDetail
}

export function TrackDetailClient({
  track: initialTrack,
}: TrackDetailClientProps) {
  const [track, setTrack] = useState<AdminTrackDetail>(initialTrack)
  const [expandedLessons, setExpandedLessons] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {}
    initialTrack.lessons.forEach((l) => {
      initial[l.slug] = true
    })
    return initial
  })

  const [lessonModal, setLessonModal] = useState<{
    isOpen: boolean
    lesson?: AdminLessonSummary
  }>({ isOpen: false })

  const [sectionModal, setSectionModal] = useState<{
    isOpen: boolean
    lessonSlug?: string
    section?: AdminSectionSummary
  }>({ isOpen: false })

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean
    type: "lesson" | "section"
    lessonId?: number
    sectionId?: number
    lessonSlug: string
    sectionSlug?: string
    title: string
  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const toggleLesson = (slug: string) => {
    setExpandedLessons((prev) => ({ ...prev, [slug]: !prev[slug] }))
  }

  const handleUpsertLesson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const position = Number(formData.get("position") || 0)

    startTransition(async () => {
      const res = await upsertLessonAction(
        track.id,
        title,
        lessonModal.lesson?.id,
        position,
        track.slug,
      )

      if (!res.ok) {
        setError(res.error || "Erro ao salvar aula.")
        return
      }

      setTrack((prev) => {
        const existing = prev.lessons.find(
          (l) => l.id === lessonModal.lesson?.id,
        )
        let updatedLessons: AdminLessonSummary[]

        if (existing) {
          updatedLessons = prev.lessons.map((l) =>
            l.id === lessonModal.lesson?.id
              ? {
                  ...l,
                  id: res.lesson.id,
                  slug: res.lesson.slug,
                  title: res.lesson.title,
                  position: res.lesson.position ?? l.position,
                }
              : l,
          )
        } else {
          updatedLessons = [
            ...prev.lessons,
            {
              id: res.lesson.id,
              slug: res.lesson.slug,
              title: res.lesson.title,
              position:
                res.lesson.position ??
                (position > 0 ? position : prev.lessons.length + 1),
              sections: res.lesson.sections ?? [],
            },
          ]
        }

        return {
          ...prev,
          lessons: updatedLessons.sort((a, b) => a.position - b.position),
        }
      })

      setLessonModal({ isOpen: false })
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmModal) return
    setError(null)

    const { type, lessonId, sectionId, lessonSlug } = deleteConfirmModal

    startTransition(async () => {
      if (type === "lesson" && lessonId) {
        const res = await deleteLessonAction(lessonId, track.slug)
        setDeleteConfirmModal(null)
        if (!res.ok) {
          setError(res.error || "Erro ao excluir aula.")
          return
        }
        setTrack((prev) => ({
          ...prev,
          lessons: prev.lessons.filter((l) => l.id !== lessonId),
        }))
      } else if (type === "section" && sectionId) {
        const res = await deleteSectionAction(sectionId, track.slug)
        setDeleteConfirmModal(null)
        if (!res.ok) {
          setError(res.error || "Erro ao excluir seção.")
          return
        }
        setTrack((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === lessonId || l.slug === lessonSlug
              ? {
                  ...l,
                  sections: l.sections.filter((s) => s.id !== sectionId),
                }
              : l,
          ),
        }))
      }
    })
  }

  const handleUpsertSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const targetLesson = track.lessons.find(
      (l) => l.slug === sectionModal.lessonSlug,
    )
    if (!targetLesson) return
    setError(null)
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const kind = formData.get("kind") as "TEXT" | "EXERCISE"
    const position = Number(formData.get("position") || 0)

    startTransition(async () => {
      const res = await upsertSectionAction(
        targetLesson.id,
        title,
        sectionModal.section?.id,
        kind,
        sectionModal.section?.contentMarkdown ?? "",
        position,
        track.slug,
        targetLesson.slug,
        sectionModal.section?.slug,
      )

      if (!res.ok) {
        setError(res.error || "Erro ao salvar seção.")
        return
      }

      setTrack((prev) => {
        return {
          ...prev,
          lessons: prev.lessons.map((lesson) => {
            if (lesson.id !== targetLesson.id) return lesson

            const existingSec = lesson.sections.find(
              (s) => s.id === sectionModal.section?.id,
            )
            let updatedSections: AdminSectionSummary[]

            if (existingSec) {
              updatedSections = lesson.sections.map((s) =>
                s.id === sectionModal.section?.id
                  ? {
                      ...s,
                      id: res.section.id,
                      slug: res.section.slug,
                      title: res.section.title,
                      kind: res.section.kind,
                      position: res.section.position,
                    }
                  : s,
              )
            } else {
              updatedSections = [
                ...lesson.sections,
                {
                  id: res.section.id,
                  slug: res.section.slug,
                  title: res.section.title,
                  kind: res.section.kind,
                  position: res.section.position,
                  contentMarkdown: res.section.contentMarkdown,
                },
              ]
            }

            updatedSections.sort((a, b) => a.position - b.position)

            return { ...lesson, sections: updatedSections }
          }),
        }
      })

      setSectionModal({ isOpen: false })
    })
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
        <Link
          href="/studio"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Icon icon="lucide:layout-dashboard" className="size-3.5" />
          <span>Studio</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold line-clamp-1">
          {track.title}
        </span>
      </div>

      {/* Header com Info da Trilha */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {track.category && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: track.category.color }}
              >
                {track.category.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 bg-foreground/5 px-3 py-1 rounded-full">
              <Icon icon="lucide:book-open" className="size-3.5" />
              {track.lessons.length}{" "}
              {track.lessons.length === 1 ? "aula" : "aulas"}
            </span>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">
            {track.title}
          </h1>

          <p className="text-sm text-foreground/70 leading-relaxed">
            {track.description || "Sem descrição informada para esta trilha."}
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-foreground/40 pt-1">
            <span>slug: {track.slug}</span>
            <span>•</span>
            <span>id: {track.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto pt-2 md:pt-0">
          <ButtonWrapper
            variant="primary"
            onClick={() => {
              setError(null)
              setLessonModal({ isOpen: true })
            }}
            className="px-4 py-2.5 rounded-xl shadow-xs text-xs!"
          >
            <Icon icon="lucide:plus" className="size-4" />
            <ButtonText className="font-bold text-xs">Nova Aula</ButtonText>
          </ButtonWrapper>
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:alert-circle" className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Lista de Aulas e Seções */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Icon icon="lucide:layers" className="size-5 text-foreground/40" />
            Estrutura da Trilha ({track.lessons.length}{" "}
            {track.lessons.length === 1 ? "aula" : "aulas"})
          </h2>
        </div>

        {track.lessons.length === 0 ? (
          <CardWrapper className="p-12 text-center flex flex-col items-center gap-3">
            <div className="p-3 bg-foreground/5 rounded-2xl text-foreground/40">
              <Icon icon="lucide:folder-plus" className="size-8" />
            </div>
            <p className="text-foreground/60 font-medium text-sm">
              Esta trilha ainda não possui nenhuma aula. Clique no botão acima
              para adicionar a primeira aula.
            </p>
          </CardWrapper>
        ) : (
          <div className="flex flex-col gap-4">
            {track.lessons.map((lesson) => {
              const isExpanded = expandedLessons[lesson.slug] ?? true

              return (
                <CardWrapper key={lesson.slug} className="p-0 overflow-hidden">
                  <div className="flex items-center justify-between p-4 sm:p-5 bg-foreground/5 border-b border-foreground/10">
                    <button
                      type="button"
                      onClick={() => toggleLesson(lesson.slug)}
                      className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
                    >
                      <span className="flex items-center justify-center size-8 rounded-xl bg-white border border-foreground/10 text-xs font-bold text-foreground shadow-xs">
                        #{lesson.position}
                      </span>
                      <div>
                        <h3 className="text-base font-display font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          <span>{lesson.title}</span>
                          <span className="text-xs font-medium text-foreground/40">
                            ({lesson.sections.length}{" "}
                            {lesson.sections.length === 1 ? "seção" : "seções"})
                          </span>
                        </h3>
                        <div className="text-xxs font-semibold text-foreground/40">
                          slug: {lesson.slug} • id: {lesson.id}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <ButtonWrapper
                        variant="secondary"
                        border={false}
                        type="button"
                        onClick={() =>
                          setSectionModal({
                            isOpen: true,
                            lessonSlug: lesson.slug,
                          })
                        }
                        className="px-3! py-1.5! text-xs! gap-1 hover:bg-foreground/5"
                      >
                        <Icon
                          icon="lucide:plus"
                          className="size-3.5 text-foreground"
                        />
                        <ButtonText className="text-xs! font-bold">
                          Seção
                        </ButtonText>
                      </ButtonWrapper>

                      <ButtonWrapper
                        variant="secondary"
                        border={false}
                        type="button"
                        onClick={() => setLessonModal({ isOpen: true, lesson })}
                        className="px-3! py-1.5! text-xs! hover:bg-foreground/5"
                        title="Editar Aula"
                      >
                        <Icon
                          icon="lucide:pencil"
                          className="size-3.5 text-foreground"
                        />
                      </ButtonWrapper>

                      <ButtonWrapper
                        variant="secondary"
                        border={false}
                        type="button"
                        onClick={() =>
                          setDeleteConfirmModal({
                            isOpen: true,
                            type: "lesson",
                            lessonId: lesson.id,
                            lessonSlug: lesson.slug,
                            title: lesson.title,
                          })
                        }
                        className="px-3! py-1.5! text-xs! hover:bg-red-50"
                        title="Excluir Aula"
                      >
                        <Icon
                          icon="lucide:trash-2"
                          className="size-3.5 text-red-600"
                        />
                      </ButtonWrapper>

                      <button
                        type="button"
                        onClick={() => toggleLesson(lesson.slug)}
                        className="p-2 text-foreground/40 hover:text-foreground transition-all cursor-pointer"
                      >
                        <Icon
                          icon={
                            isExpanded
                              ? "lucide:chevron-up"
                              : "lucide:chevron-down"
                          }
                          className="size-4.5"
                        />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 flex flex-col gap-3">
                      {lesson.sections.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-foreground/40 border border-dashed border-foreground/15 rounded-xl">
                          Nenhuma seção nesta aula. Clique em "+ Seção" para
                          adicionar conteúdo.
                        </div>
                      ) : (
                        lesson.sections.map((section) => (
                          <div
                            key={section.slug}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-foreground/10 bg-white hover:bg-foreground/5 transition-all group"
                          >
                            <Link
                              href={`/studio/${track.slug}/lessons/${lesson.slug}/sections/${section.slug}/edit`}
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                            >
                              <span className="flex items-center justify-center size-7 rounded-lg bg-foreground/5 text-xxs font-bold text-foreground/60">
                                {section.position}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                    {section.title}
                                  </span>
                                  <BadgeWrapper className="px-2.5! py-0.5! border-foreground/10!">
                                    <BadgeIcon size={12}>
                                      <Icon
                                        icon={
                                          section.kind === "EXERCISE"
                                            ? "lucide:code-2"
                                            : "lucide:file-text"
                                        }
                                        className={
                                          section.kind === "EXERCISE"
                                            ? "text-amber-500"
                                            : "text-primary"
                                        }
                                      />
                                    </BadgeIcon>
                                    <BadgeValue className="text-xxs! font-bold">
                                      {section.kind === "EXERCISE"
                                        ? "EXERCÍCIO"
                                        : "TEXTO"}
                                    </BadgeValue>
                                  </BadgeWrapper>
                                </div>
                                <div className="text-xxs font-medium text-foreground/40">
                                  slug: {section.slug} • id: {section.id}
                                </div>
                              </div>
                            </Link>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <ButtonWrapper
                                variant="secondary"
                                border={false}
                                type="button"
                                onClick={() =>
                                  setSectionModal({
                                    isOpen: true,
                                    lessonSlug: lesson.slug,
                                    section,
                                  })
                                }
                                className="px-3! py-1.5! text-xs! hover:bg-foreground/5"
                                title="Editar Propriedades"
                              >
                                <Icon
                                  icon="lucide:pencil"
                                  className="size-3.5 text-foreground"
                                />
                              </ButtonWrapper>

                              <ButtonWrapper
                                variant="secondary"
                                border={false}
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    isOpen: true,
                                    type: "section",
                                    lessonId: lesson.id,
                                    sectionId: section.id,
                                    lessonSlug: lesson.slug,
                                    sectionSlug: section.slug,
                                    title: section.title,
                                  })
                                }
                                className="px-3! py-1.5! text-xs! hover:bg-red-50"
                                title="Excluir Seção"
                              >
                                <Icon
                                  icon="lucide:trash-2"
                                  className="size-3.5 text-red-600"
                                />
                              </ButtonWrapper>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardWrapper>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão (Aula / Seção) */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-foreground/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">
                Confirmar Exclusão
              </h3>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="size-5" />
              </button>
            </div>

            <p className="text-sm text-foreground/70 font-medium leading-relaxed">
              Tem certeza que deseja excluir{" "}
              {deleteConfirmModal.type === "lesson" ? "a aula" : "a seção"}{" "}
              <strong className="text-foreground font-bold">
                {deleteConfirmModal.title}
              </strong>
              ?{" "}
              {deleteConfirmModal.type === "lesson" &&
                "Esta ação removerá também todas as seções desta aula."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <ButtonWrapper
                variant="secondary"
                border={false}
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-5! py-2! text-xs!"
              >
                <ButtonText className="text-xs! font-bold">Cancelar</ButtonText>
              </ButtonWrapper>

              <ButtonWrapper
                variant="secondary"
                border={false}
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="px-5! py-2! text-xs! hover:bg-red-50 text-red-600"
              >
                {isPending && (
                  <Icon
                    icon="mdi:update"
                    className="size-3.5 animate-spin text-red-600"
                  />
                )}
                <ButtonText className="text-xs! font-bold text-red-600">
                  Excluir{" "}
                  {deleteConfirmModal.type === "lesson" ? "Aula" : "Seção"}
                </ButtonText>
              </ButtonWrapper>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lição */}
      {lessonModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-foreground/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-foreground">
                {lessonModal.lesson ? "Editar Aula" : "Nova Aula"}
              </h2>
              <button
                type="button"
                onClick={() => setLessonModal({ isOpen: false })}
                className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpsertLesson} className="flex flex-col gap-4">
              <InputWrapper>
                <InputLabel htmlFor="lesson-title">Título da Aula *</InputLabel>
                <InputField>
                  <InputControl
                    id="lesson-title"
                    name="title"
                    type="text"
                    required
                    defaultValue={lessonModal.lesson?.title || ""}
                    placeholder="Ex: Introdução ao NestJS e Arquitetura"
                  />
                </InputField>
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="lesson-position">
                  Ordem / Posição
                </InputLabel>
                <InputField>
                  <InputControl
                    id="lesson-position"
                    name="position"
                    type="number"
                    min={1}
                    defaultValue={
                      lessonModal.lesson?.position || track.lessons.length + 1
                    }
                  />
                </InputField>
              </InputWrapper>

              <div className="flex items-center justify-end gap-3 pt-2">
                <ButtonWrapper
                  variant="secondary"
                  border={false}
                  type="button"
                  onClick={() => setLessonModal({ isOpen: false })}
                  className="px-5! py-2! text-xs!"
                >
                  <ButtonText className="text-xs! font-bold">
                    Cancelar
                  </ButtonText>
                </ButtonWrapper>
                <ButtonWrapper
                  variant="primary"
                  type="submit"
                  disabled={isPending}
                  className="px-5! py-2! text-xs!"
                >
                  {isPending && (
                    <Icon icon="mdi:update" className="size-4 animate-spin" />
                  )}
                  <ButtonText className="text-xs! font-bold">
                    Salvar Aula
                  </ButtonText>
                </ButtonWrapper>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Seção */}
      {sectionModal.isOpen &&
        (() => {
          const currentLesson = track.lessons.find(
            (l) => l.slug === sectionModal.lessonSlug,
          )
          const defaultPosition =
            sectionModal.section?.position ??
            (currentLesson?.sections.length || 0) + 1

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-foreground/10 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-display font-bold text-foreground">
                    {sectionModal.section ? "Editar Seção" : "Nova Seção"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSectionModal({ isOpen: false })}
                    className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Icon icon="lucide:x" className="size-5" />
                  </button>
                </div>

                <form
                  onSubmit={handleUpsertSection}
                  className="flex flex-col gap-4"
                >
                  <InputWrapper>
                    <InputLabel htmlFor="sec-title">
                      Título da Seção *
                    </InputLabel>
                    <InputField>
                      <InputControl
                        id="sec-title"
                        name="title"
                        type="text"
                        required
                        defaultValue={sectionModal.section?.title || ""}
                        placeholder="Ex: Conceitos Fundamentais de DTOs"
                      />
                    </InputField>
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="sec-kind">Tipo de Conteúdo</InputLabel>
                    <select
                      id="sec-kind"
                      name="kind"
                      defaultValue={sectionModal.section?.kind || "TEXT"}
                      className="rounded-2xl border-2 border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-all font-medium"
                    >
                      <option value="TEXT">
                        TEXTO (Artigo / Teoria em Markdown)
                      </option>
                      <option value="EXERCISE">
                        EXERCÍCIO (Prática / Desafio)
                      </option>
                    </select>
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="sec-position">
                      Ordem / Posição
                    </InputLabel>
                    <InputField>
                      <InputControl
                        id="sec-position"
                        name="position"
                        type="number"
                        min={1}
                        defaultValue={defaultPosition}
                      />
                    </InputField>
                  </InputWrapper>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <ButtonWrapper
                      variant="secondary"
                      border={false}
                      type="button"
                      onClick={() => setSectionModal({ isOpen: false })}
                      className="px-5! py-2! text-xs!"
                    >
                      <ButtonText className="text-xs! font-bold">
                        Cancelar
                      </ButtonText>
                    </ButtonWrapper>
                    <ButtonWrapper
                      variant="secondary"
                      border={false}
                      type="submit"
                      disabled={isPending}
                      className="px-5! py-2! text-xs! gap-1.5"
                    >
                      {isPending && (
                        <Icon
                          icon="mdi:update"
                          className="size-3.5 animate-spin text-foreground"
                        />
                      )}
                      <ButtonText className="text-xs! font-bold">
                        Salvar Seção
                      </ButtonText>
                    </ButtonWrapper>
                  </div>
                </form>
              </div>
            </div>
          )
        })()}
    </div>
  )
}
