"use client"

import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  )
}

