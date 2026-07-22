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
import { ButtonText, ButtonWrapper } from "@/components/button"
import { CardWrapper } from "@/components/card/card-wrapper"
import { BadgeIcon, BadgeValue, BadgeWrapper } from "@/components/gamification"
import { Icon } from "@/components/icon"
import { upsertSectionAction } from "@/lib/studio/actions"
import type { AdminSectionSummary } from "@/lib/studio/types"

interface MarkdownEditorClientProps {
  trackSlug: string
  lessonSlug: string
  section: AdminSectionSummary
}

function parseInlineMarkdown(text?: string): React.ReactNode {
  if (!text) return null

  const regex =
    /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g

  const elements: React.ReactNode[] = []
  let lastIndex = 0
  let match = regex.exec(text)

  while (match !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index))
    }

    const key = `inline-${match.index}-${lastIndex}`

    if (match[1]) {
      // Link: [label](url)
      const label = match[2]
      const url = match[3]
      elements.push(
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-bold underline hover:opacity-80"
        >
          {parseInlineMarkdown(label)}
        </a>,
      )
    } else if (match[4]) {
      // Bold: **text**
      elements.push(
        <strong key={key} className="font-bold text-foreground">
          {parseInlineMarkdown(match[5])}
        </strong>,
      )
    } else if (match[6]) {
      // Italic: *text*
      elements.push(
        <em key={key} className="italic text-foreground">
          {parseInlineMarkdown(match[7])}
        </em>,
      )
    } else if (match[8]) {
      // Code: `text`
      elements.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-md bg-foreground/10 text-primary font-mono text-xs font-semibold"
        >
          {match[9]}
        </code>,
      )
    }

    lastIndex = regex.lastIndex
    match = regex.exec(text)
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex))
  }

  return elements.length === 1 ? elements[0] : elements
}

function highlightCode(code: string): React.ReactNode {
  const lineItems = code.split("\n").map((line, pos) => ({
    id: `code-line-${pos}-${line.slice(0, 8)}`,
    line,
  }))

  return lineItems.map(({ id, line }) => {
    const trimmed = line.trim()
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*")
    ) {
      return (
        <div key={id} className="text-zinc-500 italic leading-relaxed">
          {line}
        </div>
      )
    }

    const regex =
      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/.+$)|(\b(?:const|let|var|function|return|import|export|from|if|else|for|while|async|await|class|interface|type|extends|try|catch|throw|new|default|typeof|instanceof|null|undefined|true|false|boolean|string|number)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g

    const elements: React.ReactNode[] = []
    let lastIndex = 0
    let match = regex.exec(line)

    while (match !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`} className="text-zinc-200">
            {line.substring(lastIndex, match.index)}
          </span>,
        )
      }

      const tokenKey = `token-${id}-${match.index}`

      if (match[1]) {
        // String literal
        elements.push(
          <span key={tokenKey} className="text-emerald-300">
            {match[1]}
          </span>,
        )
      } else if (match[2]) {
        // Inline comment
        elements.push(
          <span key={tokenKey} className="text-zinc-500 italic">
            {match[2]}
          </span>,
        )
      } else if (match[3]) {
        // Keyword
        elements.push(
          <span key={tokenKey} className="text-purple-400 font-semibold">
            {match[3]}
          </span>,
        )
      } else if (match[4]) {
        // Number
        elements.push(
          <span key={tokenKey} className="text-amber-300">
            {match[4]}
          </span>,
        )
      } else if (match[5]) {
        // Function name
        elements.push(
          <span key={tokenKey} className="text-sky-300 font-semibold">
            {match[5]}
          </span>,
        )
      }

      lastIndex = regex.lastIndex
      match = regex.exec(line)
    }

    if (lastIndex < line.length) {
      elements.push(
        <span key={`text-end-${lastIndex}`} className="text-zinc-200">
          {line.substring(lastIndex)}
        </span>,
      )
    }

    return (
      <div key={id} className="leading-relaxed">
        {elements.length === 0 ? " " : elements}
      </div>
    )
  })
}

export function MarkdownEditorClient({
  trackSlug,
  lessonSlug,
  section,
}: MarkdownEditorClientProps) {
  const [contentMarkdown, setContentMarkdown] = useState(
    section.contentMarkdown,
  )
  const [sectionTitle, setSectionTitle] = useState(section.title)
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
        trackSlug,
        lessonSlug,
        section.slug,
        sectionTitle,
        section.kind,
        contentMarkdown,
        section.position,
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

  const renderedPreview = useMemo(() => {
    if (!contentMarkdown.trim()) {
      return (
        <p className="text-foreground/40 italic text-sm">
          Nenhum conteúdo digitado ainda...
        </p>
      )
    }

    const lineObjects = contentMarkdown.split("\n").map((line, pos) => ({
      lineId: `preview-${pos}-${line.slice(0, 10)}`,
      line,
    }))

    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let currentLang = ""
    let codeBuffer: string[] = []

    lineObjects.forEach(({ lineId, line }) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false
          const codeText = codeBuffer.join("\n")
          const langDisplay = currentLang || "code"
          elements.push(
            <div
              key={`cb-${lineId}`}
              className="my-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-4 py-2 text-xxs font-mono font-bold uppercase tracking-wider text-zinc-400">
                <span className="flex items-center gap-1.5 text-primary">
                  <Icon icon="lucide:code-2" className="size-3.5" />
                  {langDisplay}
                </span>
                <span className="text-zinc-500">Mio Code</span>
              </div>
              <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-zinc-200">
                <code>{highlightCode(codeText)}</code>
              </pre>
            </div>,
          )
          codeBuffer = []
          currentLang = ""
        } else {
          inCodeBlock = true
          currentLang = line.replace("```", "").trim()
        }
        return
      }

      if (inCodeBlock) {
        codeBuffer.push(line)
        return
      }

      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${lineId}`}
            className="text-2xl font-black text-foreground font-display tracking-tight border-b border-foreground/10 pb-2 mt-4 mb-2"
          >
            {parseInlineMarkdown(line.replace("# ", ""))}
          </h1>,
        )
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${lineId}`}
            className="text-xl font-bold text-foreground font-display tracking-tight mt-4 mb-2"
          >
            {parseInlineMarkdown(line.replace("## ", ""))}
          </h2>,
        )
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${lineId}`}
            className="text-lg font-bold text-foreground font-display tracking-tight mt-3 mb-1"
          >
            {parseInlineMarkdown(line.replace("### ", ""))}
          </h3>,
        )
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={`bq-${lineId}`}
            className="border-l-4 border-primary bg-primary/10 px-4 py-2 text-sm text-foreground font-medium my-2 rounded-r-xl"
          >
            {parseInlineMarkdown(line.replace("> ", ""))}
          </blockquote>,
        )
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li
            key={`ul-${lineId}`}
            className="ml-5 list-disc text-sm text-foreground my-1"
          >
            {parseInlineMarkdown(line.replace(/^[-*]\s+/, ""))}
          </li>,
        )
      } else if (/^\d+\.\s+/.test(line)) {
        elements.push(
          <li
            key={`ol-${lineId}`}
            className="ml-5 list-decimal text-sm text-foreground my-1"
          >
            {parseInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}
          </li>,
        )
      } else if (line.trim() === "") {
        elements.push(<div key={`sp-${lineId}`} className="h-2" />)
      } else {
        elements.push(
          <p
            key={`p-${lineId}`}
            className="text-sm leading-relaxed text-foreground my-1"
          >
            {parseInlineMarkdown(line)}
          </p>,
        )
      }
    })

    return elements
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
              {renderedPreview}
            </div>
          </CardWrapper>
        )}
      </div>
    </div>
  )
}
