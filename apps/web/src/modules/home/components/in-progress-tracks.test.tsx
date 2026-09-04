import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { InProgressTracks } from "./in-progress-tracks"

describe("InProgressTracks", () => {
  it("deve renderizar a listagem de trilhas quando houver itens", () => {
    const mockTracks = [
      {
        trackId: 1,
        trackSlug: "front-end",
        trackTitle: "Mundo do Front-End",
        totalLessons: 20,
        completedLessons: 9,
        progressPercentage: 45,
        currentLessonSlug: "html-basics",
        currentLessonTitle: "Fundamentos do HTML",
      },
      {
        trackId: 2,
        trackSlug: "js-essencial",
        trackTitle: "JavaScript Essencial",
        totalLessons: 25,
        completedLessons: 8,
        progressPercentage: 30,
        currentLessonSlug: "js-basics",
        currentLessonTitle: "Variáveis e Funções",
      },
    ]

    render(<InProgressTracks tracks={mockTracks} />)

    expect(screen.getByText(/Cursos em Andamento/i)).toBeInTheDocument()
    expect(screen.getByText("Mundo do Front-End")).toBeInTheDocument()
    expect(screen.getByText("JavaScript Essencial")).toBeInTheDocument()
    expect(screen.getByText(/Ver todos/i)).toBeInTheDocument()
  })

  it("deve renderizar estado vazio com botão para explorar trilhas quando tracks estiver vazio", () => {
    render(<InProgressTracks tracks={[]} />)

    expect(screen.getByText(/Nenhum curso em andamento/i)).toBeInTheDocument()
    expect(screen.getByText(/Explorar Trilhas/i)).toBeInTheDocument()
  })
})
