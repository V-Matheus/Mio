import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import type { UserAchievementsPage } from "@/modules/achievements/types"
import { AchievementsSection } from "./achievements-section"

const { mockLoadMore } = vi.hoisted(() => ({ mockLoadMore: vi.fn() }))

vi.mock("@/modules/achievements/actions", () => ({
  loadMoreAchievementsAction: mockLoadMore,
}))

let observerCallback: IntersectionObserverCallback | null = null

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false
  }

  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // biome-ignore lint/suspicious/noExplicitAny: jsdom não implementa IntersectionObserver
  ;(global as any).IntersectionObserver = MockIntersectionObserver
})

const mockPage: UserAchievementsPage = {
  items: [
    {
      slug: "first-lesson",
      title: "Primeiro passo",
      description: "Conclua sua primeira lição.",
      iconUrl: null,
      unlocked: true,
      unlockedAt: "2026-05-11T20:30:06.000Z",
      progress: 1,
      threshold: 1,
    },
  ],
  total: 3,
  unlockedTotal: 1,
}

describe("AchievementsSection", () => {
  beforeEach(() => {
    mockLoadMore.mockReset()
    observerCallback = null
  })

  it("não renderiza nada quando não há conquistas", () => {
    const { container } = render(
      <AchievementsSection
        initialPage={{ items: [], total: 0, unlockedTotal: 0 }}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("renderiza o resumo com a contagem de conquistas desbloqueadas", () => {
    render(<AchievementsSection initialPage={mockPage} />)

    expect(screen.getByText("Conquistas")).toBeInTheDocument()
    expect(screen.getByText("1 de 3")).toBeInTheDocument()
  })

  it("abre o modal com a página inicial ao clicar em 'Ver todas as conquistas'", () => {
    render(<AchievementsSection initialPage={mockPage} />)

    fireEvent.click(
      screen.getByRole("button", { name: "Ver todas as conquistas" }),
    )

    expect(screen.getByText("1 de 3 desbloqueadas")).toBeInTheDocument()
    expect(screen.getByText("Desbloqueada")).toBeInTheDocument()
  })

  it("carrega mais conquistas via scroll infinito quando o sentinela fica visível", async () => {
    mockLoadMore.mockResolvedValueOnce({
      items: [
        {
          slug: "ten-lessons",
          title: "Maratonista",
          description: "Conclua 10 lições.",
          iconUrl: null,
          unlocked: false,
          unlockedAt: null,
          progress: 3,
          threshold: 10,
        },
      ],
      total: 3,
      unlockedTotal: 1,
    })

    render(<AchievementsSection initialPage={mockPage} />)
    fireEvent.click(
      screen.getByRole("button", { name: "Ver todas as conquistas" }),
    )

    expect(observerCallback).not.toBeNull()

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    await waitFor(() => {
      expect(mockLoadMore).toHaveBeenCalledWith(10, 1)
    })
    await waitFor(() => {
      expect(screen.getByText("Maratonista")).toBeInTheDocument()
    })
  })
})
