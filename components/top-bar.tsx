"use client"

import { useState, useEffect } from "react"
import { Globe, Download, Upload, ChevronDown, RefreshCw } from "lucide-react"

interface TopBarProps {
  onClear: () => void
  onImport: () => Promise<void>
  onExport: () => void
  currentLanguage: string
  availableLanguages: string[]
  onChangeLanguage: (language: string) => void
  getTranslatedString: (key: string) => string
}

export function TopBar({
  onClear,
  onImport,
  onExport,
  currentLanguage,
  availableLanguages,
  onChangeLanguage,
  getTranslatedString,
}: TopBarProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-md shadow-lg py-2"
          : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            {getTranslatedString("app.title") || "Deck Builder"}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
              aria-label={getTranslatedString("language") || "Language"}
            >
              <Globe className="w-5 h-5 mr-2" />
              <span className="uppercase">{currentLanguage}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onChangeLanguage(lang)
                      setShowLanguageMenu(false)
                    }}
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

          {/* Clear Button */}
          <button
            onClick={onClear}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
            aria-label={getTranslatedString("button.clear") || "Clear"}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            <span>{getTranslatedString("button.clear") || "Clear"}</span>
          </button>

          {/* Import Button */}
          <button
            onClick={onImport}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
          >
            <Download className="w-5 h-5 mr-2" />
            <span>{getTranslatedString("import_from_clipboard") || "Import"}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
          >
            <Upload className="w-5 h-5 mr-2" />
            <span>{getTranslatedString("export_to_clipboard") || "Export"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

