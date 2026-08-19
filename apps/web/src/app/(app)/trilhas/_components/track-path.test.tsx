import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { LessonSummary } from "@/lib/catalog/types"
import { TrackPath } from "./track-path"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock("@/lib/catalog/actions", () => ({
  enrollInTrackAction: vi.fn().mockResolvedValue({ ok: true }),
}))

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false
  })
})

describe("TrackPath", () => {
  const mockLessons: LessonSummary[] = [
    {
      id: 1,
      slug: "intro-html",
      title: "Introdução ao HTML",
      position: 1,
      completed: false,
    },
    {
      id: 2,
      slug: "tags-basicas",
      title: "Primeiras Tags",
      position: 2,
      completed: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("abre o modal 'Matricular-se na Trilha' ao clicar no botão de matrícula", () => {
    render(
      <TrackPath
        trackId={1}
        trackSlug="front-end"
        trackTitle="Mundo do Front-End"
        lessons={mockLessons}
        enrolled={false}
      />,
    )

    const enrollButton = screen.getByRole("button", {
      name: /matricular-se nesta trilha/i,
    })
    fireEvent.click(enrollButton)

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Matricular-se na Trilha",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/confirmar matrícula e começar/i),
    ).toBeInTheDocument()
  })

  it("abre o modal 'Aula Bloqueada' com o título da aula ao clicar em uma aula não matriculada", () => {
    render(
      <TrackPath
        trackId={1}
        trackSlug="front-end"
        trackTitle="Mundo do Front-End"
        lessons={mockLessons}
        enrolled={false}
      />,
    )

    const lessonTitleButton = screen.getByRole("button", {
      name: "Primeiras Tags",
    })
    fireEvent.click(lessonTitleButton)

    expect(
      screen.getByRole("heading", { level: 3, name: "Aula Bloqueada" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/matricular-se para desbloquear/i),
    ).toBeInTheDocument()
    expect(screen.getAllByText("Primeiras Tags").length).toBeGreaterThanOrEqual(
      2,
    )
  })
})
