"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Download, Upload, RefreshCw, Share2, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { StylizedTitle } from "./stylized-title"
// HelpModal import 추가
import { HelpModal } from "./ui/modal/HelpModal"

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
  const [showHelpPopup, setShowHelpPopup] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const helpPopupRef = useRef<HTMLDivElement>(null)

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

  // 도움말 버튼 클릭 핸들러
  const toggleHelpPopup = () => {
    setShowHelpPopup(!showHelpPopup)
  }

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node) &&
        !event.target.closest(".language-button")
      ) {
        setShowLanguageMenu(false)
      }
      if (
        showHelpPopup &&
        helpPopupRef.current &&
        !helpPopupRef.current.contains(event.target as Node) &&
        !event.target.closest(".help-button")
      ) {
        setShowHelpPopup(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showLanguageMenu, showHelpPopup])

  // 상단 바 컴포넌트의 버튼 색상 일관성 있게 변경
  const buttonBaseClass =
    "neon-button flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 shadow-md relative overflow-hidden"

  // 버튼 아이콘 스타일 클래스
  const iconClass = "w-5 h-5 text-[hsl(var(--neon-white))] relative z-10"

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md shadow-lg py-2" : "bg-black py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center">
          <StylizedTitle
            mainText={getTranslatedString("app.title.main") || "레조넌스"}
            subText={getTranslatedString("app.title.sub") || "SOLSTICE"}
          />
        </div>

        {/* Actions - now with only icons */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative language-dropdown">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className={`${buttonBaseClass} language-button`}
              aria-label={getTranslatedString("language") || "Language"}
            >
              <Globe className={iconClass} />
            </button>

            {showLanguageMenu && (
              <div
                ref={languageMenuRef}
                className="absolute right-0 mt-2 w-40 neon-dropdown animate-fadeIn bg-black bg-opacity-95"
              >
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-150 ${
                      currentLanguage === lang
                        ? "bg-[rgba(255,255,255,0.1)] text-[hsl(var(--neon-white))] neon-text"
                        : ""
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
            className={`${buttonBaseClass} share-button`}
            aria-label={getTranslatedString("share") || "Share"}
          >
            <Share2 className={iconClass} />
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            className={`${buttonBaseClass} clear-button`}
            aria-label={getTranslatedString("button.clear") || "Clear"}
          >
            <RefreshCw className={iconClass} />
          </button>

          {/* Import Button */}
          <button
            onClick={onImport}
            className={`${buttonBaseClass} import-button`}
            aria-label={getTranslatedString("import_from_clipboard") || "Import"}
          >
            <Download className={iconClass} />
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className={`${buttonBaseClass} export-button`}
            aria-label={getTranslatedString("export_to_clipboard") || "Export"}
          >
            <Upload className={iconClass} />
          </button>

          {/* Help Button */}
          <button
            onClick={toggleHelpPopup}
            className={`${buttonBaseClass} help-button`}
            aria-label={getTranslatedString("help") || "Help"}
          >
            <HelpCircle className={iconClass} />
          </button>
        </div>
      </div>

      {/* 새 HelpModal 컴포넌트 추가 (return 문 마지막에 추가) */}
      <HelpModal
        isOpen={showHelpPopup}
        onClose={() => setShowHelpPopup(false)}
        getTranslatedString={getTranslatedString}
        maxWidth="max-w-2xl"
      />
    </div>
  )
}

