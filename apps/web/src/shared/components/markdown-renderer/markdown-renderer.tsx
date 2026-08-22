import type { ComponentProps } from "react"
import { useMemo } from "react"
import { Icon } from "@/shared/components/icon"
import { cn } from "@/shared/utils"

export interface MarkdownRendererProps
  extends Omit<ComponentProps<"div">, "content"> {
  content?: string | null
  className?: string
}

export function parseInlineMarkdown(text?: string): React.ReactNode {
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

export function highlightCode(code: string): React.ReactNode {
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
        elements.push(
          <span key={tokenKey} className="text-emerald-300">
            {match[1]}
          </span>,
        )
      } else if (match[2]) {
        elements.push(
          <span key={tokenKey} className="text-zinc-500 italic">
            {match[2]}
          </span>,
        )
      } else if (match[3]) {
        elements.push(
          <span key={tokenKey} className="text-purple-400 font-semibold">
            {match[3]}
          </span>,
        )
      } else if (match[4]) {
        elements.push(
          <span key={tokenKey} className="text-amber-300">
            {match[4]}
          </span>,
        )
      } else if (match[5]) {
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

export function MarkdownRenderer({
  content,
  className,
  ...props
}: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content?.trim()) {
      return (
        <p className="text-foreground/40 italic text-sm">
          Nenhum conteúdo disponível.
        </p>
      )
    }

    const lineObjects = content.split("\n").map((line, pos) => ({
      lineId: `line-${pos}-${line.slice(0, 10)}`,
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
  }, [content])

  return (
    <div
      data-slot="markdown-renderer"
      className={cn("w-full space-y-2 text-foreground", className)}
      {...props}
    >
      {renderedContent}
    </div>
  )
}
