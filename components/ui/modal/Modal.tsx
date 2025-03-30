"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
  closeOnOutsideClick?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-3xl",
  closeOnOutsideClick = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, closeOnOutsideClick])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  // 모달이 열릴 때 body에 modal-open 클래스 추가
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="neon-modal-backdrop fixed inset-0 flex items-center justify-center z-[100]">
      <div
        ref={modalRef}
        className={`neon-modal ${maxWidth} w-full flex flex-col max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            className="neon-modal-header sticky top-0 z-20 flex flex-col justify-between items-center shadow-md"
            style={{ backgroundColor: "var(--modal-header-bg)" }}
          >
            <div className="w-full flex justify-between items-center">
              <div className="flex-1">{title}</div>

            </div>
          </div>
        )}

        <div className="flex-grow" style={{ backgroundColor: "var(--modal-content-bg)" }}>
          {children}
        </div>

        {footer && <div className="neon-modal-footer sticky bottom-0 z-20">{footer}</div>}
      </div>
    </div>
  )
}

