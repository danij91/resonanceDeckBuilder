"use client"

interface LanguageSelectorProps {
  currentLanguage: string
  onChangeLanguage: (language: string) => void
  availableLanguages: string[]
  getTranslatedString: (key: string) => string
}

export function LanguageSelector({
  currentLanguage,
  onChangeLanguage,
  availableLanguages,
  getTranslatedString,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <label htmlFor="language" className="text-sm font-medium">
        {getTranslatedString("language") || "Language"}:
      </label>
      <select
        id="language"
        value={currentLanguage}
        onChange={(e) => onChangeLanguage(e.target.value)}
        className="p-1 border rounded text-sm"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  )
}

