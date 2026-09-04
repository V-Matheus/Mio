import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NextSteps } from "./next-steps"

describe("NextSteps", () => {
  it("deve renderizar o card de Próxima Aula quando houver trilha em andamento", () => {
    const mockTracks = [
      {
        trackId: 1,
        trackSlug: "front-end",
        trackTitle: "Mundo do Front-End",
        totalLessons: 20,
        completedLessons: 9,
        progressPercentage: 45,
        currentLessonSlug: "atributos-html",
        currentLessonTitle: "Atributos HTML",
      },
    ]

    render(<NextSteps inProgressTracks={mockTracks} />)

    expect(screen.getByText(/Próximos Passos/i)).toBeInTheDocument()
    expect(screen.getByText(/Próxima Aula/i)).toBeInTheDocument()
    expect(screen.getByText("Atributos HTML")).toBeInTheDocument()
    expect(screen.getByText("Mundo do Front-End")).toBeInTheDocument()
    expect(screen.getByText(/Desafio Diário/i)).toBeInTheDocument()
    expect(screen.getByText(/Complete 1 aula hoje/i)).toBeInTheDocument()
    expect(screen.getByText(/\+50 XP de bônus/i)).toBeInTheDocument()
  })

  it("deve renderizar CTA para explorar catálogo caso não haja trilha em andamento", () => {
    render(<NextSteps inProgressTracks={[]} />)

    expect(screen.getByText(/Começar a Estudar/i)).toBeInTheDocument()
    expect(screen.getByText(/Escolha sua primeira trilha/i)).toBeInTheDocument()
  })
})
