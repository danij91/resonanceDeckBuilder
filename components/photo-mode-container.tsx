"use client"

import type React from "react"

import { useRef } from "react"
import { ScreenshotButton } from "./screenshot-button"

interface PhotoModeContainerProps {
  isPhotoMode: boolean
  children: React.ReactNode
}

export function PhotoModeContainer({ isPhotoMode, children }: PhotoModeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 ${isPhotoMode ? "photo-mode bg-black py-4 px-2" : ""}`}
    >
      {children}
      <ScreenshotButton targetRef={containerRef} isPhotoMode={isPhotoMode} />
    </div>
  )
}

