"use client"

import { useState } from "react"

interface ImportExportProps {
  onExport: () => { success: boolean; message: string }
  onImport: () => Promise<{ success: boolean; message: string }>
  getTranslatedString: (key: string) => string
}

export function ImportExport({ onExport, onImport, getTranslatedString }: ImportExportProps) {
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)

  const handleExport = () => {
    const result = onExport()
    setMessage({
      text: result.message,
      isError: !result.success,
    })

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  const handleImport = async () => {
    try {
      const result = await onImport()
      setMessage({
        text: result.message,
        isError: !result.success,
      })

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setMessage({
        text: getTranslatedString("import_failed") || "Import failed!",
        isError: true,
      })

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    }
  }

  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">{getTranslatedString("import_export") || "Import/Export"}</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleImport} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          {getTranslatedString("import_from_clipboard") || "Import from Clipboard"}
        </button>

        <button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded-lg">
          {getTranslatedString("export_to_clipboard") || "Export to Clipboard"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-3 p-2 rounded ${message.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}

