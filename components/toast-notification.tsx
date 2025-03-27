"use client"

import { useEffect, useState } from "react"

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

  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-500 text-green-700"
      : type === "error"
        ? "bg-red-100 border-red-500 text-red-700"
        : "bg-blue-100 border-blue-500 text-blue-700"

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
  let nextId = 0

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = nextId++
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

