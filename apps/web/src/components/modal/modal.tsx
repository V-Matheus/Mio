"use client"

import type { ComponentProps, ReactNode } from "react"
import { useEffect, useRef } from "react"
import { Icon } from "@/components/icon"
import { cn } from "@/utils"

export interface ModalProps
  extends Omit<ComponentProps<"dialog">, "className"> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  className?: string
  containerClassName?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  containerClassName,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }

    dialog.addEventListener("cancel", handleCancel)
    return () => dialog.removeEventListener("cancel", handleCancel)
  }, [onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: handled by dialog cancel event listener
    <dialog
      ref={dialogRef}
      data-slot="modal"
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-50 m-auto flex max-w-md w-full items-center justify-center border-none bg-transparent p-4 outline-none backdrop:bg-black/60 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95 duration-200",
        containerClassName,
      )}
      {...props}
    >
      <div
        data-slot="modal-container"
        className={cn(
          "relative flex w-full flex-col items-center rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-2xl",
          className,
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/5 hover:text-foreground transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" className="size-5" />
          </button>
        )}

        {title && (
          <h3 className="font-display text-2xl font-extrabold text-foreground">
            {title}
          </h3>
        )}

        {description && (
          <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
            {description}
          </p>
        )}

        {children}
      </div>
    </dialog>
  )
}
