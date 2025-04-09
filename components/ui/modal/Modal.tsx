"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

// 모달 관리를 위한 전역 변수
let modalCounter = 0

export interface ModalProps {
  isOpen: boolean
  onClose: (e?: React.MouseEvent) => void
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
  // 각 모달 인스턴스에 고유 ID 부여
  const [modalId] = useState(() => `modal-${modalCounter++}`)
  // 모달의 z-index 관리
  const [zIndex, setZIndex] = useState(100)

  // 모달이 열릴 때 z-index 증가
  useEffect(() => {
    if (isOpen) {
      // 현재 열린 모달 중 가장 높은 z-index 찾기
      const modals = document.querySelectorAll(".neon-modal-backdrop")
      let maxZIndex = 100

      modals.forEach((modal) => {
        const currentZIndex = Number.parseInt(window.getComputedStyle(modal).zIndex, 10)
        if (currentZIndex > maxZIndex) {
          maxZIndex = currentZIndex
        }
      })

      // 현재 모달의 z-index를 가장 높은 값 + 10으로 설정
      setZIndex(maxZIndex + 10)
    }
  }, [isOpen])

  // ESC 키로 모달 닫기 - 가장 위에 있는 모달만 닫히도록 수정
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // 현재 열린 모달 중 가장 높은 z-index를 가진 모달 찾기
        const modals = document.querySelectorAll(".neon-modal-backdrop")
        let maxZIndex = 0
        let topModalId = ""

        modals.forEach((modal) => {
          const currentZIndex = Number.parseInt(window.getComputedStyle(modal).zIndex, 10)
          if (currentZIndex > maxZIndex) {
            maxZIndex = currentZIndex
            topModalId = modal.id
          }
        })

        // 현재 모달이 가장 위에 있는 경우에만 닫기
        if (topModalId === modalId) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose, modalId])

  // 모달이 열릴 때 body에 modal-open 클래스 추가
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open")
    } else {
      // 열린 모달이 없는 경우에만 modal-open 클래스 제거
      const openModals = document.querySelectorAll(".neon-modal-backdrop")
      if (openModals.length <= 1) {
        document.body.classList.remove("modal-open")
      }
    }

    return () => {
      // 컴포넌트 언마운트 시 열린 모달이 없는 경우에만 modal-open 클래스 제거
      const openModals = document.querySelectorAll(".neon-modal-backdrop")
      if (openModals.length <= 1) {
        document.body.classList.remove("modal-open")
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      id={modalId}
      className="neon-modal-backdrop fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      onClick={(e) => {
        // 현재 모달의 backdrop을 클릭한 경우에만 닫기
        if (closeOnOutsideClick && e.target === e.currentTarget) {
          console.log("Modal backdrop clicked, closing modal")
          onClose(e)
        }
      }}
    >
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
