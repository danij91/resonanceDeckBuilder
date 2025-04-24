"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Globe, Download, Upload, RefreshCw, Share2, HelpCircle, Save, FolderOpen, UsersRound } from "lucide-react"
import { StylizedTitle } from "./stylized-title"
import { HelpModal } from "./ui/modal/HelpModal"
import { useLanguage } from "../contexts/language-context"
import { ScreenshotButton } from "./screenshot-button" // 추가

interface TopBarProps {
  onClear: () => void
  onImport: () => Promise<void>
  onExport: () => void
  onShare: () => void
  onSave: () => void // 추가: 저장 버튼 핸들러
  onLoad: () => void // 추가: 불러오기 버튼 핸들러
  onSortCharacters?: () => void
  contentRef: React.RefObject<HTMLElement> // 추가: 캡처할 컨텐츠 참조
}

export function TopBar({
  onClear,
  onImport,
  onExport,
  onShare,
  onSave,
  onLoad,
  onSortCharacters,
  contentRef,
}: TopBarProps) {
  const { currentLanguage, supportedLanguages, getTranslatedString, changeLanguage, isChangingLanguage } = useLanguage()

  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showHelpPopup, setShowHelpPopup] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const helpPopupRef = useRef<HTMLDivElement>(null)
  // 언어 버튼 참조 추가
  const languageButtonRef = useRef<HTMLButtonElement>(null)

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

    // 언어 변경
    changeLanguage(lang)

    // 메뉴 닫기
    setShowLanguageMenu(false)
  }

  // 언어 메뉴 토글 핸들러 수정 - 드롭다운이 언어 버튼의 왼쪽 선에 맞춰서 나오도록 변경
  const toggleLanguageMenu = () => {
    if (!showLanguageMenu && languageButtonRef.current) {
      // 버튼 위치 계산
      const rect = languageButtonRef.current.getBoundingClientRect()

      // 드롭다운 메뉴 위치 설정 - 버튼 왼쪽에 맞춤
      document.documentElement.style.setProperty("--language-dropdown-top", `${rect.bottom}px`)
      document.documentElement.style.setProperty("--language-dropdown-left", `${rect.left}px`)
      document.documentElement.style.setProperty("--language-dropdown-right", "auto")
    }
    setShowLanguageMenu(!showLanguageMenu)
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

  // 상단 바 컴포넌트의 버튼 크기 조정 - 작은 화면에서 더 작게 표시
  const buttonBaseClass = `neon-button flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors duration-200 shadow-md relative overflow-hidden`

  // 버튼 아이콘 스타일 클래스 - 작은 화면에서 더 작게 표시
  const iconClass = `w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--neon-white))] relative z-10`

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-black/80 backdrop-blur-md shadow-lg py-2" : "bg-black py-4"
        }`}
        style={{ width: "100%" }}
      >
        <div className="container mx-auto px-4">
          {/* 큰 화면에서는 타이틀과 버튼이 같은 행에 표시되고, 작은 화면에서는 버튼이 아래로 내려감 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Logo/Title - 스크롤 시 숨김 */}
            <div className={`flex items-center ${scrolled ? "hidden" : ""}`}>
              <a href={`/${currentLanguage}`} className="cursor-pointer hover:opacity-80 transition-opacity">
                <StylizedTitle
                  mainText={getTranslatedString("app.title.main") || "레조넌스"}
                  subText={getTranslatedString("app.title.sub") || "SOLSTICE"}
                />
              </a>
            </div>

            {/* 버튼들 - 작은 화면에서는 가로 스크롤, 큰 화면에서는 오른쪽 정렬 */}
            {/* 간격 조절 - space-x-3에서 space-x-1로 변경하여 더 많은 버튼이 화면에 들어오도록 함 */}
            <div className="flex items-center space-x-1 sm:space-x-2 mt-2 md:mt-0 overflow-x-auto py-1 justify-end">
              {/* Language Selector */}
              <div className="relative language-dropdown">
                <button
                  ref={languageButtonRef}
                  onClick={toggleLanguageMenu}
                  className={`${buttonBaseClass} language-button ${isChangingLanguage ? "opacity-50" : ""}`}
                  aria-label={getTranslatedString("language") || "Language"}
                  title={getTranslatedString("language") || "Language"}
                  disabled={isChangingLanguage}
                >
                  <Globe className={iconClass} />
                </button>

                {showLanguageMenu && (
                  <div
                    ref={languageMenuRef}
                    className="fixed mt-2 w-40 neon-dropdown animate-fadeIn bg-black bg-opacity-95 z-[100]"
                    style={{
                      top: "var(--language-dropdown-top, 4rem)",
                      left: "var(--language-dropdown-left, auto)",
                      right: "var(--language-dropdown-right, auto)",
                    }}
                  >
                    {supportedLanguages.map((lang) => (
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

              {/* Screenshot Button - 캡처 버튼으로 변경 */}
              <ScreenshotButton targetRef={contentRef} getTranslatedString={getTranslatedString} />

              {/* Share Button */}
              <button
                onClick={onShare}
                className={`${buttonBaseClass} share-button`}
                aria-label={getTranslatedString("share") || "Share"}
                title={getTranslatedString("share") || "Share"}
              >
                <Share2 className={iconClass} />
              </button>

              {/* Save Button - 추가 */}
              <button
                onClick={onSave}
                className={`${buttonBaseClass} save-button`}
                aria-label={getTranslatedString("save_deck") || "Save Deck"}
                title={getTranslatedString("save_deck") || "Save Deck"}
              >
                <Save className={iconClass} />
              </button>

              {/* Load Button - 추가 */}
              <button
                onClick={onLoad}
                className={`${buttonBaseClass} load-button`}
                aria-label={getTranslatedString("load_deck") || "Load Deck"}
                title={getTranslatedString("load_deck") || "Load Deck"}
              >
                <FolderOpen className={iconClass} />
              </button>

              {/* Sort Characters Button - 추가 */}
              {onSortCharacters && (
                <button
                  onClick={onSortCharacters}
                  className={`${buttonBaseClass} sort-button`}
                  aria-label={getTranslatedString("sort_characters") || "Sort Characters"}
                  title={getTranslatedString("sort_characters") || "Sort Characters"}
                >
                  <UsersRound className={iconClass} />
                </button>
              )}

              {/* Clear Button */}
              <button
                onClick={onClear}
                className={`${buttonBaseClass} clear-button`}
                aria-label={getTranslatedString("button.clear") || "Clear"}
                title={getTranslatedString("button.clear") || "Clear"}
              >
                <RefreshCw className={iconClass} />
              </button>

              {/* Import Button */}
              <button
                onClick={onImport}
                className={`${buttonBaseClass} import-button`}
                aria-label={getTranslatedString("import_from_clipboard") || "Import"}
                title={getTranslatedString("import_from_clipboard") || "Import"}
              >
                <Download className={iconClass} />
              </button>

              {/* Export Button */}
              <button
                onClick={onExport}
                className={`${buttonBaseClass} export-button`}
                aria-label={getTranslatedString("export_to_clipboard") || "Export"}
                title={getTranslatedString("export_to_clipboard") || "Export"}
              >
                <Upload className={iconClass} />
              </button>

              {/* Help Button */}
              <button
                onClick={toggleHelpPopup}
                className={`${buttonBaseClass} help-button`}
                aria-label={getTranslatedString("help.title") || "Help"}
                title={getTranslatedString("help.title") || "Help"}
              >
                <HelpCircle className={iconClass} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 도움말 모달 - 전체 화면을 덮도록 수정하고 TopBar 바깥으로 이동 */}
      {showHelpPopup && (
        <HelpModal
          isOpen={showHelpPopup}
          onClose={() => setShowHelpPopup(false)}
          getTranslatedString={getTranslatedString}
          maxWidth="max-w-2xl"
        />
      )}
    </>
  )
}
