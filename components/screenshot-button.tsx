"use client"

import type React from "react"

import { useState } from "react"
import { Camera } from "lucide-react"
import * as htmlToImage from "html-to-image"
import { analytics, logEvent } from "../lib/firebase-config"

interface ScreenshotButtonProps {
  targetRef: React.RefObject<HTMLElement>
  getTranslatedString: (key: string) => string
}

export function ScreenshotButton({ targetRef, getTranslatedString }: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  const captureScreenshot = async () => {
    if (!targetRef.current) return

    try {
      if (analytics && typeof window !== "undefined") {
        logEvent(analytics, "take_screen_shot", {
        })
      }
      setIsCapturing(true)

      // 캡처 모드 클래스 추가 - 테두리 효과 제거를 위한 클래스
      if (targetRef.current) {
        targetRef.current.classList.add("capture-mode")
      }

      // DOM이 업데이트될 시간을 주기 위해 약간 지연
      await new Promise((resolve) => setTimeout(resolve, 300))

      // 스크린샷 캡처
      const dataUrl = await htmlToImage.toPng(targetRef.current, {
        quality: 1,
        pixelRatio: 1,
        backgroundColor: "#000000",
      })

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement("a")
      link.download = `deck-builder-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Screenshot capture failed:", error)
    } finally {
      // 캡처 모드 클래스 제거
      if (targetRef.current) {
        targetRef.current.classList.remove("capture-mode")
      }
      setIsCapturing(false)
    }
  }

  return (
    <>
      <button
        onClick={captureScreenshot}
        disabled={isCapturing}
        className={`neon-button flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors duration-200 shadow-md relative overflow-hidden
        ${isCapturing ? "opacity-50 cursor-not-allowed" : ""}
      `}
        title={getTranslatedString("capture_screenshot") || "Capture Screenshot"}
      >
        <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--neon-white))] relative z-10" />
        {isCapturing && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
      </button>

      {/* 캡처 중 오버레이 - DOM 외부에 위치하지만 화면 위에 표시됨 */}
      {isCapturing && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {getTranslatedString("capturing_screenshot") || "Capturing screenshot..."}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

