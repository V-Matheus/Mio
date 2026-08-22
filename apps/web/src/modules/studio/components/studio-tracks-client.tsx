"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import type { Category } from "@/modules/catalog/types"
import {
  createTrackAction,
  deleteTrackAction,
  updateTrackAction,
} from "@/modules/studio/actions"
import type { AdminTrack } from "@/modules/studio/types"
import { ButtonText, ButtonWrapper } from "@/shared/components/button"
import { CardWrapper } from "@/shared/components/card/card-wrapper"
import { Icon } from "@/shared/components/icon"
import {
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/shared/components/input"

interface StudioTracksClientProps {
  initialTracks: AdminTrack[]
  categories?: Category[]
  userRoles: string[]
}

export function StudioTracksClient({
  initialTracks,
  categories = [],
  userRoles,
}: StudioTracksClientProps) {
  const [tracks, setTracks] = useState<AdminTrack[]>(initialTracks)
  const [search, setSearch] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTrack, setEditingTrack] = useState<AdminTrack | null>(null)
  const [confirmDeleteTrack, setConfirmDeleteTrack] =
    useState<AdminTrack | null>(null)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const availableCategories = categories

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const term = search.toLowerCase()
      return (
        track.title.toLowerCase().includes(term) ||
        Boolean(track.description?.toLowerCase().includes(term))
      )
    })
  }, [tracks, search])

  const totalLessons = useMemo(() => {
    return tracks.reduce((acc, t) => acc + (t.lessonCount || 0), 0)
  }, [tracks])

  const handleCreateTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await createTrackAction(formData)
      if (!res.ok) {
        setError(res.error || "Erro ao criar trilha.")
        return
      }
      if (res.ok && "track" in res && res.track) {
        setTracks((prev) => [res.track, ...prev])
      }
      setIsCreateOpen(false)
    })
  }

  const handleUpdateTrack = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTrack) return
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await updateTrackAction(
        editingTrack.id,
        formData,
        editingTrack.slug,
      )
      if (!res.ok) {
        setError(res.error || "Erro ao atualizar trilha.")
        return
      }

      if (res.ok && "track" in res && res.track) {
        const updatedTrack = res.track
        setTracks((prev) =>
          prev.map((t) => (t.id === editingTrack.id ? updatedTrack : t)),
        )
      }
      setEditingTrack(null)
    })
  }

  const handleDeleteTrack = (track: AdminTrack) => {
    setDeletingSlug(track.slug)
    startTransition(async () => {
      const res = await deleteTrackAction(track.id)
      if (!res.ok) {
        setError(res.error || "Erro ao remover trilha.")
      } else {
        setTracks((prev) => prev.filter((t) => t.id !== track.id))
      }
      setDeletingSlug(null)
      setConfirmDeleteTrack(null)
    })
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wider uppercase mb-1">
            <Icon icon="lucide:layout-dashboard" className="size-4" />
            <span>Studio do Instrutor</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            Gerenciador de Conteúdo
          </h1>
          <p className="mt-1 text-base text-foreground/70">
            Crie, edite e organize suas trilhas e aulas em tempo real.
          </p>
        </div>

        <ButtonWrapper
          variant="primary"
          onClick={() => {
            setError(null)
            setIsCreateOpen(true)
          }}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all"
        >
          <Icon icon="lucide:plus" className="size-5" />
          <ButtonText className="font-bold text-sm">Nova Trilha</ButtonText>
        </ButtonWrapper>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-white p-5 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon icon="lucide:layers" className="size-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground/60 uppercase">
              Total de Trilhas
            </span>
            <p className="text-2xl font-black font-display text-foreground">
              {tracks.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-white p-5 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Icon icon="lucide:book-open" className="size-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground/60 uppercase">
              Total de Aulas
            </span>
            <p className="text-2xl font-black font-display text-foreground">
              {totalLessons}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-white p-5 shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
            <Icon icon="lucide:shield-check" className="size-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground/60 uppercase">
              Permissão
            </span>
            <p className="text-sm font-bold font-display text-foreground capitalize">
              {userRoles.join(", ").toLowerCase()}
            </p>
          </div>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-foreground/10 bg-white p-4 shadow-xs">
        <InputWrapper className="w-full sm:max-w-md">
          <InputField>
            <InputControl
              placeholder="Buscar por título ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputField>
        </InputWrapper>

        <span className="text-xs font-bold text-foreground/60 self-end sm:self-center">
          {filteredTracks.length}{" "}
          {filteredTracks.length === 1
            ? "trilha encontrada"
            : "trilhas encontradas"}
        </span>
      </div>

      {/* Tracks Grid */}
      {filteredTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-foreground/20 p-12 text-center bg-white">
          <Icon
            icon="lucide:folder-open"
            className="size-12 text-foreground/30 mb-3"
          />
          <p className="text-base font-bold text-foreground">
            Nenhuma trilha cadastrada
          </p>
          <p className="text-sm text-foreground/60 mt-1 max-w-sm">
            Clique no botão "Nova Trilha" acima para começar a estruturar o
            conteúdo do seu curso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track) => (
            <CardWrapper
              key={track.slug}
              className="flex flex-col justify-between p-6 rounded-2xl border border-foreground/10 bg-white hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {track.category && (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: track.category.color }}
                      >
                        {track.category.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 bg-foreground/5 px-2.5 py-1 rounded-full">
                      <Icon icon="lucide:book-open" className="size-3.5" />
                      {track.lessonCount}{" "}
                      {track.lessonCount === 1 ? "aula" : "aulas"}
                    </span>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        setEditingTrack(track)
                      }}
                      className="p-1.5 rounded-lg text-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Editar detalhes"
                    >
                      <Icon icon="lucide:pencil" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        setConfirmDeleteTrack(track)
                      }}
                      className="p-1.5 rounded-lg text-foreground/50 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Excluir trilha"
                    >
                      <Icon icon="lucide:trash-2" className="size-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-display font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                    {track.title}
                  </h3>
                  <p className="text-xs text-foreground/60 mt-2 line-clamp-2">
                    {track.description || "Sem descrição cadastrada."}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-foreground/5 flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono text-foreground/40 truncate">
                  slug: {track.slug}
                </span>

                <Link
                  href={`/studio/${track.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <span>Gerenciar Aulas</span>
                  <Icon icon="lucide:chevron-right" className="size-4" />
                </Link>
              </div>
            </CardWrapper>
          ))}
        </div>
      )}

      {/* Modal de Exclusão de Trilha */}
      {confirmDeleteTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-foreground/10 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="p-2.5 bg-red-50 rounded-xl">
                <Icon icon="lucide:alert-triangle" className="size-6" />
              </span>
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  Confirmar Exclusão
                </h3>
                <p className="text-xs text-foreground/60">
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground/80">
              Tem certeza que deseja excluir a trilha{" "}
              <strong className="text-foreground">
                "{confirmDeleteTrack.title}"
              </strong>
              ? Todas as aulas e seções associadas serão permanentemente
              removidas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-foreground/10">
              <ButtonWrapper
                variant="secondary"
                border={false}
                type="button"
                onClick={() => setConfirmDeleteTrack(null)}
                className="px-4 py-2 text-xs!"
              >
                <ButtonText className="text-xs! font-bold">Cancelar</ButtonText>
              </ButtonWrapper>

              <ButtonWrapper
                variant="secondary"
                border={false}
                type="button"
                disabled={isPending}
                onClick={() => handleDeleteTrack(confirmDeleteTrack)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs!"
              >
                {deletingSlug === confirmDeleteTrack.slug && (
                  <Icon
                    icon="mdi:update"
                    className="size-3.5 animate-spin text-red-600"
                  />
                )}
                <ButtonText className="text-xs! font-bold text-red-600">
                  Excluir Trilha
                </ButtonText>
              </ButtonWrapper>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Trilha */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-foreground/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Icon icon="lucide:plus-circle" className="size-5" />
                </span>
                <h2 className="text-lg font-display font-bold text-foreground">
                  Nova Trilha
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrack} className="flex flex-col gap-4">
              <InputWrapper>
                <InputLabel htmlFor="create-title">
                  Título da Trilha *
                </InputLabel>
                <InputField>
                  <InputControl
                    id="create-title"
                    name="title"
                    type="text"
                    required
                    placeholder="Ex: Formação Node.js & NestJS"
                  />
                </InputField>
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="create-category">Categoria *</InputLabel>
                <select
                  id="create-category"
                  name="categoryId"
                  required
                  defaultValue=""
                  className="w-full rounded-2xl border-2 border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Selecione uma categoria...
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="create-description">
                  Descrição (Opcional)
                </InputLabel>
                <textarea
                  id="create-description"
                  name="description"
                  rows={3}
                  placeholder="Descreva o objetivo e tópicos abordados nesta trilha..."
                  className="rounded-2xl border-2 border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-all resize-none"
                />
              </InputWrapper>

              <div className="flex items-center justify-end gap-3 pt-2">
                <ButtonWrapper
                  variant="secondary"
                  border={false}
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-6! py-2.5! text-xs!"
                >
                  <ButtonText className="text-xs! font-bold">
                    Cancelar
                  </ButtonText>
                </ButtonWrapper>

                <ButtonWrapper
                  variant="primary"
                  type="submit"
                  disabled={isPending}
                  className="px-6! py-2.5! text-xs!"
                >
                  {isPending && (
                    <Icon icon="mdi:update" className="size-4 animate-spin" />
                  )}
                  <ButtonText className="text-xs! font-bold">
                    Criar Trilha
                  </ButtonText>
                </ButtonWrapper>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Trilha */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-foreground/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Icon icon="lucide:pencil" className="size-5" />
                </span>
                <h2 className="text-lg font-display font-bold text-foreground">
                  Editar Trilha
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingTrack(null)}
                className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrack} className="flex flex-col gap-4">
              <InputWrapper>
                <InputLabel htmlFor="edit-title">Título da Trilha *</InputLabel>
                <InputField>
                  <InputControl
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    defaultValue={editingTrack.title}
                  />
                </InputField>
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="edit-category">Categoria *</InputLabel>
                <select
                  id="edit-category"
                  name="categoryId"
                  required
                  defaultValue={editingTrack.category?.id ?? ""}
                  className="w-full rounded-2xl border-2 border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Selecione uma categoria...
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="edit-description">
                  Descrição (Opcional)
                </InputLabel>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  defaultValue={editingTrack.description || ""}
                  className="rounded-2xl border-2 border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-all resize-none"
                />
              </InputWrapper>

              <div className="flex items-center justify-end gap-3 pt-2">
                <ButtonWrapper
                  variant="secondary"
                  border={false}
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="px-6! py-2.5! text-xs!"
                >
                  <ButtonText className="text-xs! font-bold">
                    Cancelar
                  </ButtonText>
                </ButtonWrapper>

                <ButtonWrapper
                  variant="primary"
                  type="submit"
                  disabled={isPending}
                  className="px-6! py-2.5! text-xs!"
                >
                  {isPending && (
                    <Icon icon="mdi:update" className="size-4 animate-spin" />
                  )}
                  <ButtonText className="text-xs! font-bold">
                    Salvar Alterações
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
