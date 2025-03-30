"use client"
import { Modal, type ModalProps } from "./Modal"
import { Globe, Download, Upload, RefreshCw, Share2 } from "lucide-react"

export interface HelpModalProps extends Omit<ModalProps, "children" | "title"> {
  getTranslatedString: (key: string) => string
}

export function HelpModal({ getTranslatedString, ...modalProps }: HelpModalProps) {
  // 상단 바 컴포넌트의 버튼 색상 일관성 있게 변경
  const buttonBaseClass =
    "neon-button flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 shadow-md relative overflow-hidden"

  // 버튼 아이콘 스타일 클래스
  const iconClass = "w-5 h-5 text-[hsl(var(--neon-white))] relative z-10"

  return (
    <Modal
      {...modalProps}
      title={<h2 className="text-xl font-bold neon-text">{getTranslatedString("help.title") || "Button Guide"}</h2>}
      footer={
        <div className="flex justify-end">
          <button onClick={modalProps.onClose} className="neon-button px-4 py-2 rounded-lg text-sm">
            {getTranslatedString("close")}
          </button>
        </div>
      }
    >
      <div
        className="p-6 space-y-6 overflow-y-auto max-h-[60vh]"
        style={{ backgroundColor: "var(--modal-content-bg)" }}
      >
        {/* Language Button */}
        <div className="flex items-center">
          <div className={`${buttonBaseClass} mr-4`}>
            <Globe className={iconClass} />
          </div>
          <div>
            <h3 className="font-medium neon-text">{getTranslatedString("language") || "Language"}</h3>
            <p className="text-sm text-gray-400">
              {getTranslatedString("help.language") || "Change the application language"}
            </p>
          </div>
        </div>

        {/* Share Button */}
        <div className="flex items-center">
          <div className={`${buttonBaseClass} mr-4`}>
            <Share2 className={iconClass} />
          </div>
          <div>
            <h3 className="font-medium neon-text">{getTranslatedString("share") || "Share"}</h3>
            <p className="text-sm text-gray-400">
              {getTranslatedString("help.share") || "Copy a shareable link to your clipboard"}
            </p>
          </div>
        </div>

        {/* Clear Button */}
        <div className="flex items-center">
          <div className={`${buttonBaseClass} mr-4`}>
            <RefreshCw className={iconClass} />
          </div>
          <div>
            <h3 className="font-medium neon-text">{getTranslatedString("button.clear") || "Clear"}</h3>
            <p className="text-sm text-gray-400">
              {getTranslatedString("help.clear") || "Reset all selections and settings"}
            </p>
          </div>
        </div>

        {/* Import Button */}
        <div className="flex items-center">
          <div className={`${buttonBaseClass} mr-4`}>
            <Download className={iconClass} />
          </div>
          <div>
            <h3 className="font-medium neon-text">{getTranslatedString("import_from_clipboard") || "Import"}</h3>
            <p className="text-sm text-gray-400">
              {getTranslatedString("help.import") || "Import a deck configuration from clipboard"}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center">
          <div className={`${buttonBaseClass} mr-4`}>
            <Upload className={iconClass} />
          </div>
          <div>
            <h3 className="font-medium neon-text">{getTranslatedString("export_to_clipboard") || "Export"}</h3>
            <p className="text-sm text-gray-400">
              {getTranslatedString("help.export") || "Export current deck configuration to clipboard"}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

