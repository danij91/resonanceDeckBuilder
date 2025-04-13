"use client"
import { Modal, type ModalProps } from "./Modal"
import { Globe, Download, Upload, RefreshCw, Share2, Camera, Save, FolderOpen } from "lucide-react"
import { useLanguage } from "../../../contexts/language-context"

export interface HelpModalProps extends Omit<ModalProps, "children" | "title"> {
  getTranslatedString?: (key: string) => string
}

export function HelpModal({ getTranslatedString: propGetTranslatedString, ...modalProps }: HelpModalProps) {
  const { getTranslatedString: contextGetTranslatedString } = useLanguage()

  // Use the provided getTranslatedString or the one from context
  const getTranslatedString = propGetTranslatedString || contextGetTranslatedString

  // 모든 버튼 크기와 모양 통일 - 고정 너비 추가
  const buttonBaseClass =
    "neon-button flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 shadow-md relative overflow-hidden flex-shrink-0"

  // 버튼 아이콘 스타일 클래스
  const iconClass = "w-6 h-6 text-[hsl(var(--neon-white))] relative z-10"

  return (
    <Modal
      {...modalProps}
      title={<h2 className="text-xl font-bold neon-text">{getTranslatedString("help.title") || "Button Guide"}</h2>}
      footer={
        <div className="flex justify-end">
          <button onClick={modalProps.onClose} className="neon-button px-4 py-2 rounded-lg text-sm">
            Close
          </button>
        </div>
      }
    >
      <div
        className="p-6 space-y-6 overflow-y-auto max-h-[60vh]"
        style={{ backgroundColor: "var(--modal-content-bg)" }}
      >
        {/* Language Button */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <Globe className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("language") || "Language"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.language") || "Change the application language"}
            </p>
          </div>
        </div>

        {/* Photo Mode Button */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <Camera className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("photo_mode") || "Photo Mode"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.photo_mode") || "Toggle photo mode to hide UI elements for screenshots"}
            </p>
          </div>
        </div>

        {/* Share Button */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <Share2 className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("share") || "Share"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.share") || "Copy a shareable link to your clipboard"}
            </p>
          </div>
        </div>

        {/* Clear Button */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <RefreshCw className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("button.clear") || "Clear"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.clear") || "Reset all selections and settings"}
            </p>
          </div>
        </div>

        {/* Import Button */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <Download className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("import_from_clipboard") || "Import"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.import") || "Import a deck configuration from clipboard"}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <Upload className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("export_to_clipboard") || "Export"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.export") || "Export current deck configuration to clipboard"}
            </p>
          </div>
        </div>

        {/* Save Button - 새로 추가 */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <Save className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("save_deck") || "Save Deck"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.save_deck") || "Save current deck configuration locally"}
            </p>
          </div>
        </div>

        {/* Load Button - 새로 추가 */}
        <div className="flex items-start">
          <div className={`${buttonBaseClass} mr-4`}>
            <FolderOpen className={iconClass} />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium neon-text">{getTranslatedString("load_deck") || "Load Deck"}</h3>
            <p className="text-sm text-gray-400 break-words">
              {getTranslatedString("help.load_deck") || "Load a saved deck configuration"}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
