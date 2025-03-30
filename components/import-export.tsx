"use client"

import { useState } from "react"
import { Download, Upload, Mail, Link } from "lucide-react"

interface ImportExportProps {
  onExport: () => { success: boolean; message: string }
  onImport: () => Promise<{ success: boolean; message: string }>
  getTranslatedString: (key: string) => string
  exportPresetToString: () => string
  createShareableUrl: () => { success: boolean; url: string }
}

export function ImportExport({
  onExport,
  onImport,
  getTranslatedString,
  exportPresetToString,
  createShareableUrl,
}: ImportExportProps) {
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

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

  const handleEmailCopy = () => {
    try {
      // 덱 코드 가져오기
      const deckCode = exportPresetToString()

      // 이메일 템플릿 생성
      const emailSubject = getTranslatedString("email_subject") || "Resonance Deck Build"
      const emailBody = `${getTranslatedString("email_body") || "Here's my Resonance deck build:"}

${deckCode}`

      // 이메일 템플릿을 클립보드에 복사
      navigator.clipboard.writeText(emailBody)

      setMessage({
        text: getTranslatedString("email_copy_success") || "Email content copied to clipboard!",
        isError: false,
      })

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setMessage({
        text: getTranslatedString("email_copy_failed") || "Failed to copy email content!",
        isError: true,
      })

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    }
  }

  const handleCreateShareUrl = () => {
    try {
      const result = createShareableUrl()

      if (result.success) {
        // 공유 URL을 상태에 저장
        setShareUrl(result.url)

        // 클립보드에 복사
        navigator.clipboard.writeText(result.url)

        setMessage({
          text: getTranslatedString("share_url_copied") || "Share URL copied to clipboard!",
          isError: false,
        })
      } else {
        setMessage({
          text: getTranslatedString("share_url_failed") || "Failed to create share URL!",
          isError: true,
        })
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setMessage({
        text: getTranslatedString("share_url_failed") || "Failed to create share URL!",
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

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <button onClick={handleImport} className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center">
          <Download className="w-4 h-4 mr-2" />
          {getTranslatedString("import_from_clipboard") || "Import from Clipboard"}
        </button>

        <button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          {getTranslatedString("export_to_clipboard") || "Export to Clipboard"}
        </button>

        <button onClick={handleEmailCopy} className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          {getTranslatedString("copy_email_template") || "Copy Email Template"}
        </button>

        <button
          onClick={handleCreateShareUrl}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center"
        >
          <Link className="w-4 h-4 mr-2" />
          {getTranslatedString("create_share_url") || "Create Share URL"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-3 p-2 rounded ${message.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {message.text}
        </div>
      )}

      {shareUrl && (
        <div className="mt-3 p-2 bg-gray-200 rounded">
          <p className="text-sm text-gray-700 mb-1">{getTranslatedString("share_url") || "Share URL"}:</p>
          <div className="flex items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-grow p-2 text-sm bg-white border border-gray-300 rounded"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
                setMessage({
                  text: getTranslatedString("url_copied") || "URL copied!",
                  isError: false,
                })
                setTimeout(() => setMessage(null), 3000)
              }}
              className="ml-2 px-3 py-2 bg-gray-600 text-white text-sm rounded"
            >
              {getTranslatedString("copy") || "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

