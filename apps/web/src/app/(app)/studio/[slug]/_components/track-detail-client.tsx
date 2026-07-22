"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { ButtonText, ButtonWrapper } from "@/components/button"
import { CardWrapper } from "@/components/card/card-wrapper"
import { BadgeIcon, BadgeValue, BadgeWrapper } from "@/components/gamification"
import { Icon } from "@/components/icon"
import {
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/components/input"
import {
  deleteLessonAction,
  deleteSectionAction,
  upsertLessonAction,
  upsertSectionAction,
} from "@/lib/studio/actions"
import type {
  AdminLessonSummary,
  AdminSectionSummary,
  AdminTrackDetail,
} from "@/lib/studio/types"

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
        track.slug,
        lessonModal.lesson?.slug,
        title,
        position,
      )

      if (!res.ok) {
        setError(res.error || "Erro ao salvar aula.")
        return
      }

      setTrack((prev) => {
        const existing = prev.lessons.find(
          (l) => l.slug === lessonModal.lesson?.slug,
        )
        let updatedLessons: AdminLessonSummary[]

        if (existing) {
          updatedLessons = prev.lessons.map((l) =>
            l.slug === lessonModal.lesson?.slug
              ? { ...l, title, position: position || l.position }
              : l,
          )
        } else {
          const newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          updatedLessons = [
            ...prev.lessons,
            {
              slug: newSlug,
              title,
              position: position || prev.lessons.length + 1,
              sections: [],
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

    const { type, lessonSlug, sectionSlug } = deleteConfirmModal

    startTransition(async () => {
      if (type === "lesson") {
        const res = await deleteLessonAction(track.slug, lessonSlug)
        setDeleteConfirmModal(null)
        if (!res.ok) {
          setError(res.error || "Erro ao excluir aula.")
          return
        }
        setTrack((prev) => ({
          ...prev,
          lessons: prev.lessons.filter((l) => l.slug !== lessonSlug),
        }))
      } else if (type === "section" && sectionSlug) {
        const res = await deleteSectionAction(
          track.slug,
          lessonSlug,
          sectionSlug,
        )
        setDeleteConfirmModal(null)
        if (!res.ok) {
          setError(res.error || "Erro ao excluir seção.")
          return
        }
        setTrack((prev) => ({
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.slug === lessonSlug
              ? {
                  ...l,
                  sections: l.sections.filter((s) => s.slug !== sectionSlug),
                }
              : l,
          ),
        }))
      }
    })
  }

  const handleUpsertSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const targetLessonSlug = sectionModal.lessonSlug
    if (!targetLessonSlug) return
    setError(null)
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const kind = formData.get("kind") as "TEXT" | "EXERCISE"
    const position = Number(formData.get("position") || 0)

    startTransition(async () => {
      const res = await upsertSectionAction(
        track.slug,
        targetLessonSlug,
        sectionModal.section?.slug,
        title,
        kind,
        sectionModal.section?.contentMarkdown ||
          "# Conteúdo da Seção\n\nEscreva seu conteúdo em markdown aqui...",
        position,
      )

      if (!res.ok) {
        setError(res.error || "Erro ao salvar seção.")
        return
      }

      setTrack((prev) => {
        return {
          ...prev,
          lessons: prev.lessons.map((lesson) => {
            if (lesson.slug !== sectionModal.lessonSlug) return lesson

            const existingSec = lesson.sections.find(
              (s) => s.slug === sectionModal.section?.slug,
            )
            let updatedSections: AdminSectionSummary[]

            if (existingSec) {
              updatedSections = lesson.sections.map((s) =>
                s.slug === sectionModal.section?.slug
                  ? { ...s, title, kind, position: position || s.position }
                  : s,
              )
            } else {
              const newSecSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
              updatedSections = [
                ...lesson.sections,
                {
                  slug: newSecSlug,
                  title,
                  kind,
                  position: position || lesson.sections.length + 1,
                  contentMarkdown:
                    "# Conteúdo da Seção\n\nEscreva seu conteúdo em markdown aqui...",
                },
              ]
            }

            return {
              ...lesson,
              sections: updatedSections.sort((a, b) => a.position - b.position),
            }
          }),
        }
      })

      setSectionModal({ isOpen: false })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Botão de Voltar e Cabeçalho */}
      <div className="flex flex-col gap-4">
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 text-xs font-bold text-foreground/60 hover:text-primary transition-colors w-fit"
        >
          <Icon icon="lucide:arrow-left" className="size-4" />
          Voltar para o Estúdio
        </Link>

        <CardWrapper className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 w-fit px-3 py-0.5 rounded-full border border-primary/20">
              <Icon icon="lucide:book-open" className="size-3.5" />
              {track.slug}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
              {track.title}
            </h1>
            <p className="text-foreground/60 text-sm font-medium">
              {track.description || "Sem descrição informada."}
            </p>
          </div>

          {/* Botão Primário: Criar / Nova Aula */}
          <ButtonWrapper
            variant="primary"
            type="button"
            onClick={() => setLessonModal({ isOpen: true })}
            className="px-6! py-3! text-sm! gap-2 shrink-0"
          >
            <Icon icon="lucide:plus" className="size-4.5 text-white" />
            <ButtonText className="text-sm! font-bold">Nova Aula</ButtonText>
          </ButtonWrapper>
        </CardWrapper>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          <Icon icon="lucide:alert-circle" className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de Aulas */}
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
                          slug: {lesson.slug}
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
                                  slug: {section.slug}
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
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <Icon icon="lucide:trash-2" className="size-5" />
                </span>
                <h2 className="text-lg font-display font-bold text-foreground">
                  Excluir{" "}
                  {deleteConfirmModal.type === "lesson" ? "Aula" : "Seção"}
                </h2>
              </div>
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

                {/* Botão Primário: Criar / Salvar Aula */}
                <ButtonWrapper
                  variant="primary"
                  type="submit"
                  disabled={isPending}
                  className="px-5! py-2! text-xs! gap-1.5"
                >
                  {isPending && (
                    <Icon
                      icon="mdi:update"
                      className="size-3.5 animate-spin text-white"
                    />
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
      {sectionModal.isOpen && (
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
                <InputLabel htmlFor="sec-title">Título da Seção *</InputLabel>
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
                <InputLabel htmlFor="sec-position">Ordem / Posição</InputLabel>
                <InputField>
                  <InputControl
                    id="sec-position"
                    name="position"
                    type="number"
                    min={1}
                    defaultValue={sectionModal.section?.position || 1}
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
      )}
    </div>
  )
}
