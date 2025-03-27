"use client"

import { useState } from "react"
import { Globe, Search, Share2, Clipboard, Sun, Moon, Trash2 } from "lucide-react"

interface TopBarProps {
  onClear: () => void
  onImport: () => Promise<void>
  onExport: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
  currentLanguage: string
  availableLanguages: string[]
  onChangeLanguage: (language: string) => void
  getTranslatedString: (key: string) => string
}

export function TopBar({
  onClear,
  onImport,
  onExport,
  isDarkMode,
  onToggleDarkMode,
  currentLanguage,
  availableLanguages,
  onChangeLanguage,
  getTranslatedString,
}: TopBarProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  return (
    <div className="flex justify-between items-center py-4 px-2">
      <h1 className="text-xl font-bold">{getTranslatedString("app.title") || "Deck Builder"}</h1>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="p-2 rounded-full hover:bg-gray-700"
            aria-label={getTranslatedString("language") || "Language"}
          >
            <Globe className="w-5 h-5" />
          </button>

          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onChangeLanguage(lang)
                    setShowLanguageMenu(false)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                    currentLanguage === lang ? "bg-gray-700" : ""
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="p-2 rounded-full hover:bg-gray-700" aria-label={getTranslatedString("search") || "Search"}>
          <Search className="w-5 h-5" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-700" aria-label={getTranslatedString("share") || "Share"}>
          <Share2 className="w-5 h-5" />
        </button>

        <button
          className="p-2 rounded-full hover:bg-gray-700"
          aria-label={getTranslatedString("clipboard") || "Clipboard"}
        >
          <Clipboard className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-700"
          aria-label={
            isDarkMode
              ? getTranslatedString("light_mode") || "Light Mode"
              : getTranslatedString("dark_mode") || "Dark Mode"
          }
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex mt-4 space-x-2">
        <button
          onClick={onClear}
          className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {getTranslatedString("button.clear") || "Clear"}
        </button>

        <button
          onClick={onImport}
          className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700"
        >
          <Clipboard className="w-4 h-4 mr-2" />
          {getTranslatedString("import_from_clipboard") || "Import from Clipboard"}
        </button>

        <button
          onClick={onExport}
          className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {getTranslatedString("export_to_clipboard") || "Export to Clipboard"}
        </button>
      </div>
    </div>
  )
}

