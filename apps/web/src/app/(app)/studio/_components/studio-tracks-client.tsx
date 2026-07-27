"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { ButtonText, ButtonWrapper } from "@/components/button"
import { CardWrapper } from "@/components/card/card-wrapper"
import { Icon } from "@/components/icon"
import {
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/components/input"
import {
  createTrackAction,
  deleteTrackAction,
  updateTrackAction,
} from "@/lib/studio/actions"
import type { AdminTrack } from "@/lib/studio/types"

interface StudioTracksClientProps {
  initialTracks: AdminTrack[]
  userRoles: string[]
}

export function StudioTracksClient({
  initialTracks,
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

  const isAdmin = userRoles.includes("ADMIN")

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
      const res = await updateTrackAction(editingTrack.slug, formData)
      if (!res.ok) {
        setError(res.error || "Erro ao atualizar trilha.")
        return
      }

      const updatedTitle = formData.get("title") as string
      const updatedDesc = (formData.get("description") as string) || null

      setTracks((prev) =>
        prev.map((t) =>
          t.slug === editingTrack.slug
            ? { ...t, title: updatedTitle, description: updatedDesc }
            : t,
        ),
      )
      setEditingTrack(null)
    })
  }

  const handleConfirmDeleteTrack = () => {
    if (!confirmDeleteTrack) return
    const slug = confirmDeleteTrack.slug
    setDeletingSlug(slug)
    setError(null)

    startTransition(async () => {
      const res = await deleteTrackAction(slug)
      setDeletingSlug(null)
      setConfirmDeleteTrack(null)
      if (!res.ok) {
        setError(res.error || "Erro ao excluir trilha.")
        return
      }
      setTracks((prev) => prev.filter((t) => t.slug !== slug))
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
              <Icon icon="lucide:feather" className="size-6" />
            </span>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Estúdio de Conteúdo
            </h1>
          </div>
          <p className="text-foreground/60 text-sm font-medium">
            Crie, organize e gerencie as trilhas, lições e seções de aulas da
            plataforma.
          </p>
        </div>

        {/* Botão Primário: Criar/Nova Trilha */}
        <ButtonWrapper
          variant="primary"
          type="button"
          onClick={() => {
            setError(null)
            setIsCreateOpen(true)
          }}
          className="px-6! py-3! text-sm! gap-2"
        >
          <Icon icon="lucide:plus" className="size-4.5 text-white" />
          <ButtonText className="text-sm! font-bold">Nova Trilha</ButtonText>
        </ButtonWrapper>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          <Icon icon="lucide:alert-circle" className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardWrapper className="p-5 flex items-center gap-4">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-primary/10 text-primary">
            <Icon icon="lucide:book-open" className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">
              {tracks.length}
            </div>
            <div className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              {isAdmin ? "Total de Trilhas" : "Suas Trilhas"}
            </div>
          </div>
        </CardWrapper>

        <CardWrapper className="p-5 flex items-center gap-4">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-success/10 text-success">
            <Icon icon="lucide:layers" className="size-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">
              {totalLessons}
            </div>
            <div className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Total de Aulas Cadastradas
            </div>
          </div>
        </CardWrapper>
      </div>

      {/* Barra de Filtro e Pesquisa */}
      <CardWrapper className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <InputField>
            <Icon
              icon="lucide:search"
              className="size-4 text-foreground/40 shrink-0"
            />
            <InputControl
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputField>
        </div>

        <div className="text-xs font-semibold text-foreground/40">
          Exibindo {filteredTracks.length} de {tracks.length} trilhas
        </div>
      </CardWrapper>

      {/* Lista de Trilhas (Grid / Cards) */}
      {filteredTracks.length === 0 ? (
        <CardWrapper className="p-12 text-center flex flex-col items-center gap-3">
          <div className="p-3 bg-foreground/5 rounded-2xl text-foreground/40">
            <Icon icon="lucide:folder-open" className="size-8" />
          </div>
          <p className="text-foreground/60 font-medium text-sm">
            Nenhuma trilha encontrada. Crie sua primeira trilha para começar!
          </p>
        </CardWrapper>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTracks.map((track) => {
            const isDeleting = deletingSlug === track.slug

            return (
              <CardWrapper
                key={track.slug}
                className="p-6 hover:shadow-md transition-all flex flex-col gap-4 group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                    <Icon icon="lucide:book-open" className="size-3.5" />
                    {track.lessonCount}{" "}
                    {track.lessonCount === 1 ? "aula" : "aulas"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <ButtonWrapper
                      variant="secondary"
                      border={false}
                      type="button"
                      onClick={() => {
                        setError(null)
                        setEditingTrack(track)
                      }}
                      className="px-3! py-1.5! text-xs! hover:bg-foreground/5"
                      title="Editar Trilha"
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
                      disabled={isDeleting || isPending}
                      onClick={() => setConfirmDeleteTrack(track)}
                      className="px-3! py-1.5! text-xs! hover:bg-red-50"
                      title="Excluir Trilha"
                    >
                      {isDeleting ? (
                        <Icon
                          icon="mdi:update"
                          className="size-3.5 animate-spin text-red-600"
                        />
                      ) : (
                        <Icon
                          icon="lucide:trash-2"
                          className="size-3.5 text-red-600"
                        />
                      )}
                    </ButtonWrapper>
                  </div>
                </div>

                <Link
                  href={`/studio/${track.slug}`}
                  className="flex flex-col gap-1 cursor-pointer pt-1"
                >
                  <h3 className="text-lg font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {track.title}
                  </h3>
                  <p className="text-xs text-foreground/60 font-medium line-clamp-2 min-h-[32px]">
                    {track.description || "Sem descrição informada."}
                  </p>
                </Link>
              </CardWrapper>
            )
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Trilha */}
      {confirmDeleteTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-foreground/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <Icon icon="lucide:trash-2" className="size-5" />
                </span>
                <h2 className="text-lg font-display font-bold text-foreground">
                  Excluir Trilha
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteTrack(null)}
                className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
              >
                <Icon icon="lucide:x" className="size-5" />
              </button>
            </div>

            <p className="text-sm text-foreground/70 font-medium leading-relaxed">
              Tem certeza que deseja excluir a trilha{" "}
              <strong className="text-foreground font-bold">
                {confirmDeleteTrack.title}
              </strong>
              ? Esta ação não pode ser desfeita e removerá todas as aulas
              associadas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <ButtonWrapper
                variant="secondary"
                border={false}
                type="button"
                onClick={() => setConfirmDeleteTrack(null)}
                className="px-5! py-2! text-xs!"
              >
                <ButtonText className="text-xs! font-bold">Cancelar</ButtonText>
              </ButtonWrapper>

              <ButtonWrapper
                variant="secondary"
                border={false}
                type="button"
                disabled={isPending}
                onClick={handleConfirmDeleteTrack}
                className="px-5! py-2! text-xs! hover:bg-red-50 text-red-600"
              >
                {isPending && (
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
                  className="px-6! py-2.5! text-xs! gap-1.5"
                >
                  {isPending && (
                    <Icon
                      icon="mdi:update"
                      className="size-3.5 animate-spin text-white"
                    />
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
                  variant="secondary"
                  border={false}
                  type="submit"
                  disabled={isPending}
                  className="px-6! py-2.5! text-xs! gap-1.5"
                >
                  {isPending && (
                    <Icon
                      icon="mdi:update"
                      className="size-3.5 animate-spin text-foreground"
                    />
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
