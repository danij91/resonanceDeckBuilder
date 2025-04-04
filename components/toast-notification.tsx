"use client"

import { useEffect, useState, useRef } from "react"

interface ToastProps {
  message: string
  type: "success" | "error" | "info"
  duration?: number
  onClose: () => void
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  // 기존 Toast 컴포넌트의 bgColor 부분을 다음과 같이 변경합니다.
  const bgColor =
    type === "success"
      ? "bg-white border-green-500 text-black"
      : type === "error"
        ? "bg-white border-red-500 text-black"
        : "bg-white border-blue-500 text-black"

  // 또한 Toast 컴포넌트의 return 부분에서 클래스를 다음과 같이 변경합니다.
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border-l-4 shadow-md ${bgColor} z-50`}>
      <div className="flex items-center justify-between">
        <p>{message}</p>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
    </div>
  )
}

interface ToastManagerProps {
  getTranslatedString: (key: string) => string
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "info" }>>([])
  const nextIdRef = useRef(0) // useRef를 사용하여 컴포넌트 렌더링 간에 값이 유지되도록 함

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = nextIdRef.current
    nextIdRef.current += 1 // ID 증가
    setToasts((prev) => [...prev, { id, message, type }])
    return id
  }

  const hideToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}
    </>
  )

  return { showToast, hideToast, ToastContainer }
}

