import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MarkdownRenderer } from "@/shared/components/markdown-renderer"

describe("MarkdownRenderer", () => {
  it("should render fallback text when content is empty", () => {
    render(<MarkdownRenderer content="" />)
    expect(screen.getByText("Nenhum conteúdo disponível.")).toBeInTheDocument()
  })

  it("should render markdown headers, list items, and bold text", () => {
    const md = "# Heading 1\n## Heading 2\n- **Bold item**"
    render(<MarkdownRenderer content={md} />)

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Heading 1",
    )
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Heading 2",
    )
    expect(screen.getByText("Bold item")).toBeInTheDocument()
  })

  it("should render code blocks with syntax highlighting container", () => {
    const md = "```javascript\nconst a = 10;\n```"
    render(<MarkdownRenderer content={md} />)

    expect(screen.getByText("javascript")).toBeInTheDocument()
    expect(screen.getByText("const")).toBeInTheDocument()
  })
})
