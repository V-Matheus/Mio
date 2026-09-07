import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { InProgressCard } from "./in-progress-card"

describe("InProgressCard", () => {
  const mockTrack = {
    trackId: 1,
    trackSlug: "front-end",
    trackTitle: "Mundo do Front-End",
    totalLessons: 20,
    completedLessons: 9,
    progressPercentage: 45,
    currentLessonSlug: "html-basics",
    currentLessonTitle: "Fundamentos do HTML",
  }

  it("deve renderizar o título da trilha e as métricas de progresso", () => {
    render(<InProgressCard track={mockTrack} index={0} />)

    expect(screen.getByText("Mundo do Front-End")).toBeInTheDocument()
    expect(screen.getByText(/45%/i)).toBeInTheDocument()
    expect(screen.getByText(/9\/20 aulas/i)).toBeInTheDocument()
    expect(screen.getByText(/Continuar Aprendendo/i)).toBeInTheDocument()
  })

  it("deve criar link correto para a aula atual", () => {
    render(<InProgressCard track={mockTrack} index={0} />)

    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/trilhas/front-end/aula/html-basics")
  })

  it("deve criar link para a trilha caso não haja currentLessonSlug", () => {
    render(
      <InProgressCard
        track={{ ...mockTrack, currentLessonSlug: null }}
        index={0}
      />,
    )

    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/trilhas/front-end")
  })
})
