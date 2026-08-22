import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { Modal } from "@/shared/components/modal"

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

describe("Modal", () => {
  it("should not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Modal Content
      </Modal>,
    )

    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument()
  })

  it("should render content when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Modal Content
      </Modal>,
    )

    expect(screen.getByText("Test Modal")).toBeInTheDocument()
    expect(screen.getByText("Modal Content")).toBeInTheDocument()
  })

  it("should call onClose when clicking close button", () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose}>
        Modal Content
      </Modal>,
    )

    const closeBtn = screen.getByRole("button", { name: /fechar/i })
    fireEvent.click(closeBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("should call onClose when clicking overlay backdrop", () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} data-testid="dialog">
        Modal Content
      </Modal>,
    )

    const dialog = screen.getByTestId("dialog")
    fireEvent.click(dialog)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("should call onClose when cancel event is triggered on dialog", () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} data-testid="dialog">
        Modal Content
      </Modal>,
    )

    const dialog = screen.getByTestId("dialog")
    fireEvent(dialog, new Event("cancel"))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
