"use client"

import Link from "next/link"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import { upsertSectionAction } from "@/modules/studio/actions"
import type { AdminSectionSummary } from "@/modules/studio/types"
import { BadgeIcon, BadgeValue, BadgeWrapper } from "@/shared/components/badge"
import { ButtonText, ButtonWrapper } from "@/shared/components/button"
import { CardWrapper } from "@/shared/components/card/card-wrapper"
import { Icon } from "@/shared/components/icon"
import { MarkdownRenderer } from "@/shared/components/markdown-renderer"

interface MarkdownEditorClientProps {
  lessonId: number
  trackSlug: string
  lessonSlug: string
  section: AdminSectionSummary
}

export function MarkdownEditorClient({
  lessonId,
  trackSlug,
  lessonSlug,
  section,
}: MarkdownEditorClientProps) {
  const [contentMarkdown, setContentMarkdown] = useState(
    section.contentMarkdown || "",
  )
  const [sectionTitle, setSectionTitle] = useState(section.title)
  const [_isEditingTitle, _setIsEditingTitle] = useState(false)
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">(
    "split",
  )
  const [isSaved, setIsSaved] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentMarkdown(e.target.value)
    setIsSaved(false)
  }

  const handleSave = useCallback(() => {
    setStatusMessage(null)

    startTransition(async () => {
      const res = await upsertSectionAction(
        lessonId,
        sectionTitle,
        section.id,
        section.kind,
        contentMarkdown,
        section.position,
        trackSlug,
        lessonSlug,
        section.slug,
      )

      if (!res.ok) {
        setStatusMessage(res.error || "Erro ao salvar alterações.")
        return
      }

      setIsSaved(true)
      setTimeout(() => setStatusMessage(null), 3000)
    })
  }, [
    trackSlug,
    lessonSlug,
    section.slug,
    section.kind,
    section.position,
    sectionTitle,
    contentMarkdown,
    section.id,
    lessonId,
  ])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSave])

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = contentMarkdown.substring(start, end)
    const replacement = `${prefix}${selectedText || "texto"}${suffix}`

    const newContent =
      contentMarkdown.substring(0, start) +
      replacement +
      contentMarkdown.substring(end)

    setContentMarkdown(newContent)
    setIsSaved(false)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 5),
      )
    }, 0)
  }

  const stats = useMemo(() => {
    const lines = contentMarkdown.split("\n").length
    const words = contentMarkdown.trim()
      ? contentMarkdown.trim().split(/\s+/).length
      : 0
    const chars = contentMarkdown.length
    return { lines, words, chars }
  }, [contentMarkdown])

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-4 -m-4 sm:-m-6 p-4">
      {/* Top Header Bar */}
      <CardWrapper className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/studio/${trackSlug}`}>
            <ButtonWrapper
              variant="secondary"
              border={false}
              className="p-2! hover:bg-foreground/5"
            >
              <Icon
                icon="lucide:arrow-left"
                className="size-5 text-foreground"
              />
            </ButtonWrapper>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => {
                  setSectionTitle(e.target.value)
                  setIsSaved(false)
                }}
                className="text-lg font-display font-bold text-foreground bg-transparent border-b border-transparent hover:border-foreground/20 focus:border-primary outline-none px-1 transition-all"
              />
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
                  {section.kind === "EXERCISE" ? "EXERCÍCIO" : "TEXTO"}
                </BadgeValue>
              </BadgeWrapper>
            </div>
            <div className="text-xxs font-medium text-foreground/40 px-1">
              Trilha: {trackSlug} / Aula: {lessonSlug}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-foreground/5 p-1 rounded-2xl border border-foreground/10">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-white text-foreground shadow-xs"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              Split Screen
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === "editor"
                  ? "bg-white text-foreground shadow-xs"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-white text-foreground shadow-xs"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              Preview
            </button>
          </div>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center text-xs font-medium text-foreground/40">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Salvo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Não salvo
              </span>
            )}
          </div>

          {/* Save Button */}
          <ButtonWrapper
            variant="secondary"
            border={false}
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="px-5! py-2! text-xs! gap-1.5 hover:bg-foreground/5"
            title="Salvar (Ctrl+S)"
          >
            {isPending ? (
              <Icon icon="mdi:update" className="size-3.5 animate-spin" />
            ) : (
              <Icon icon="lucide:save" className="size-3.5" />
            )}
            <ButtonText className="text-xs! font-bold">Salvar</ButtonText>
          </ButtonWrapper>
        </div>
      </CardWrapper>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 p-3 text-xs font-medium text-primary">
          <Icon icon="lucide:info" className="size-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Editor & Preview Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        {(viewMode === "split" || viewMode === "editor") && (
          <CardWrapper
            className={`p-0 flex flex-col overflow-hidden ${
              viewMode === "editor" ? "col-span-2" : ""
            }`}
          >
            <div className="flex items-center gap-1 p-2 bg-foreground/5 border-b border-foreground/10 overflow-x-auto">
              <button
                type="button"
                onClick={() => insertFormatting("# ")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg text-xs font-bold font-mono cursor-pointer"
                title="Título H1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("## ")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg text-xs font-bold font-mono cursor-pointer"
                title="Título H2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg text-xs font-bold font-mono cursor-pointer"
                title="Título H3"
              >
                H3
              </button>

              <div className="h-4 w-px bg-foreground/10 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg cursor-pointer"
                title="Negrito"
              >
                <Icon icon="lucide:bold" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg cursor-pointer"
                title="Itálico"
              >
                <Icon icon="lucide:italic" className="size-4" />
              </button>

              <div className="h-4 w-px bg-foreground/10 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting("```javascript\n", "\n```")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg cursor-pointer"
                title="Bloco de Código"
              >
                <Icon icon="lucide:code" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg cursor-pointer"
                title="Citação"
              >
                <Icon icon="lucide:quote" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg cursor-pointer"
                title="Lista"
              >
                <Icon icon="lucide:list" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("[", "](url)")}
                className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-lg cursor-pointer"
                title="Link"
              >
                <Icon icon="lucide:link" className="size-4" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={contentMarkdown}
              onChange={handleChange}
              placeholder="Escreva seu conteúdo em Markdown..."
              className="flex-1 w-full p-4 font-mono text-xs leading-relaxed text-foreground outline-none resize-none bg-white font-medium"
            />

            <div className="flex items-center justify-between px-4 py-2 bg-foreground/5 border-t border-foreground/10 text-xxs font-semibold text-foreground/40">
              <div>Pressione Ctrl+S para salvar rapidamente</div>
              <div className="flex items-center gap-3">
                <span>{stats.lines} linhas</span>
                <span>{stats.words} palavras</span>
                <span>{stats.chars} caracteres</span>
              </div>
            </div>
          </CardWrapper>
        )}

        {(viewMode === "split" || viewMode === "preview") && (
          <CardWrapper
            className={`p-0 flex flex-col overflow-hidden ${
              viewMode === "preview" ? "col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between p-3 bg-foreground/5 border-b border-foreground/10">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                <Icon icon="lucide:eye" className="size-4" />
                Visualização em Tempo Real (Preview)
              </span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto max-w-none font-sans">
              <MarkdownRenderer content={contentMarkdown} />
            </div>
          </CardWrapper>
        )}
      </div>
    </div>
  )
}
