import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AdminTrack } from "@/lib/studio/types"
import { StudioTracksClient } from "./studio-tracks-client"

vi.mock("@/lib/studio/actions", () => ({
  createTrackAction: vi.fn(),
  updateTrackAction: vi.fn(),
  deleteTrackAction: vi.fn(),
}))

const mockTracks: AdminTrack[] = [
  {
    slug: "trilha-nest",
    title: "Trilha NestJS",
    description: "Aprenda NestJS do zero ao avançado",
    creatorCode: "usr_123",
    lessonCount: 5,
  },
  {
    slug: "trilha-react",
    title: "Trilha React 19",
    description: "Dominando React 19 e Next.js",
    creatorCode: "usr_456",
    lessonCount: 3,
  },
]

describe("StudioTracksClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render studio title and track cards", () => {
    render(
      <StudioTracksClient initialTracks={mockTracks} userRoles={["TEACHER"]} />,
    )

    expect(screen.getByText("Estúdio de Conteúdo")).toBeInTheDocument()
    expect(screen.getByText("Trilha NestJS")).toBeInTheDocument()
    expect(screen.getByText("Trilha React 19")).toBeInTheDocument()
    expect(screen.getByText("5 aulas")).toBeInTheDocument()
    expect(screen.getByText("3 aulas")).toBeInTheDocument()
  })

  it("should filter tracks by search term", () => {
    render(
      <StudioTracksClient initialTracks={mockTracks} userRoles={["TEACHER"]} />,
    )

    const searchInput = screen.getByPlaceholderText(
      "Buscar por título ou descrição...",
    )
    fireEvent.change(searchInput, { target: { value: "React" } })

    expect(screen.queryByText("Trilha NestJS")).not.toBeInTheDocument()
    expect(screen.getByText("Trilha React 19")).toBeInTheDocument()
  })

  it("should open Delete confirmation modal when clicking trash icon", () => {
    render(
      <StudioTracksClient initialTracks={mockTracks} userRoles={["TEACHER"]} />,
    )

    const deleteButtons = screen.getAllByTitle("Excluir Trilha")
    const targetBtn = deleteButtons[0]
    if (targetBtn) {
      fireEvent.click(targetBtn)
    }

    expect(
      screen.getByRole("heading", { name: "Excluir Trilha" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Tem certeza que deseja excluir a trilha/),
    ).toBeInTheDocument()
  })
})
