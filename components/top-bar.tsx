"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Download, Upload, ChevronDown, RefreshCw, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { StylizedTitle } from "./stylized-title"

interface TopBarProps {
  onClear: () => void
  onImport: () => Promise<void>
  onExport: () => void
  onShare: () => void
  currentLanguage: string
  availableLanguages: string[]
  onChangeLanguage: (language: string) => void
  getTranslatedString: (key: string) => string
}

export function TopBar({
  onClear,
  onImport,
  onExport,
  onShare,
  currentLanguage,
  availableLanguages,
  onChangeLanguage,
  getTranslatedString,
}: TopBarProps) {
  const router = useRouter()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [displayMode, setDisplayMode] = useState<"full" | "compact" | "icon">("full")
  const containerRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  // Check available space and update display mode
  useEffect(() => {
    const checkSpace = () => {
      if (!containerRef.current || !actionsRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const titleWidth = containerRef.current.querySelector(".title-container")?.clientWidth || 0
      const availableWidth = containerWidth - titleWidth - 32 // 32px for padding

      // Get all buttons to calculate their full width
      const buttons = actionsRef.current.querySelectorAll("button")
      let fullWidth = 0
      let compactWidth = 0

      buttons.forEach((button) => {
        // Calculate width with text (add class temporarily to measure)
        button.classList.add("temp-measure-full")
        fullWidth += button.offsetWidth + 8 // 8px for margin
        button.classList.remove("temp-measure-full")

        // Calculate width with icon only
        button.classList.add("temp-measure-icon")
        compactWidth += button.offsetWidth + 8 // 8px for margin
        button.classList.remove("temp-measure-icon")
      })

      // Determine display mode based on available space
      if (availableWidth >= fullWidth) {
        setDisplayMode("full")
      } else if (availableWidth >= compactWidth) {
        setDisplayMode("compact")
      } else {
        setDisplayMode("icon")
      }
    }

    // Initial check
    checkSpace()

    // Add resize listener
    window.addEventListener("resize", checkSpace)
    return () => window.removeEventListener("resize", checkSpace)
  }, [])

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 언어 변경 핸들러
  const handleLanguageChange = (lang: string) => {
    // 현재 언어와 같은 언어 선택 시 드롭다운만 닫기
    if (currentLanguage === lang) {
      setShowLanguageMenu(false)
      return
    }

    // 언어 상태 업데이트
    onChangeLanguage(lang)

    // URL 변경 (페이지 이동)
    router.push(`/${lang}`)

    // 메뉴 닫기
    setShowLanguageMenu(false)
  }

  // 드롭다운 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!showLanguageMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".language-dropdown")) {
        setShowLanguageMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showLanguageMenu])

  // Determine if we should show text in buttons
  const showButtonText = displayMode === "full"
  const showCompactText = displayMode === "compact"

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-md shadow-lg py-2"
          : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-4"
      }`}
    >
      <div
        ref={containerRef}
        className="container mx-auto px-4 flex items-center justify-between"
        style={{ maxWidth: "calc(100% - 32px)" }}
      >
        {/* Logo/Title */}
        <div className="title-container flex items-center">
          <StylizedTitle
            mainText={getTranslatedString("app.title.main") || "RESONANCE"}
            subText={getTranslatedString("app.title.sub") || "SOLSTICE"}
          />
        </div>

        {/* Actions - with dynamic display mode */}
        <div ref={actionsRef} className="flex items-center space-x-2 flex-shrink-0">
          {/* Language Selector */}
          <div className="relative language-dropdown flex-shrink-0">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center px-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 temp-measure-class"
              aria-label={getTranslatedString("language") || "Language"}
            >
              <Globe className="w-5 h-5" />
              {(showButtonText || (showCompactText && currentLanguage.length <= 2)) && (
                <>
                  <span className="uppercase ml-2">{currentLanguage}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors duration-150 ${
                      currentLanguage === lang ? "bg-blue-600" : ""
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="flex items-center px-2 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 flex-shrink-0 temp-measure-class"
            aria-label={getTranslatedString("share") || "Share"}
          >
            <Share2 className="w-5 h-5" />
            {showButtonText && <span className="ml-2">{getTranslatedString("share") || "Share"}</span>}
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            className="flex items-center px-2 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 flex-shrink-0 temp-measure-class"
            aria-label={getTranslatedString("button.clear") || "Clear"}
          >
            <RefreshCw className="w-5 h-5" />
            {showButtonText && <span className="ml-2">{getTranslatedString("button.clear") || "Clear"}</span>}
          </button>

          {/* Import Button */}
          <button
            onClick={onImport}
            className="flex items-center px-2 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 flex-shrink-0 temp-measure-class"
            aria-label={getTranslatedString("import_from_clipboard") || "Import"}
          >
            <Download className="w-5 h-5" />
            {showButtonText && <span className="ml-2">{getTranslatedString("import_from_clipboard") || "Import"}</span>}
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center px-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 flex-shrink-0 temp-measure-class"
            aria-label={getTranslatedString("export_to_clipboard") || "Export"}
          >
            <Upload className="w-5 h-5" />
            {showButtonText && <span className="ml-2">{getTranslatedString("export_to_clipboard") || "Export"}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

