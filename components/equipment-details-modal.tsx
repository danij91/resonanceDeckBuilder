"use client"
import type { Equipment } from "../types"
import { Modal } from "./ui/modal/Modal"
import { formatColorText } from "../utils/format-text"
import type React from "react"

interface EquipmentDetailsModalProps {
  isOpen: boolean
  onClose: (e?: React.MouseEvent) => void
  equipment: Equipment
  getTranslatedString: (key: string) => string
  getSkill?: (skillId: number) => any
}

export function EquipmentDetailsModal({
  isOpen,
  onClose,
  equipment,
  getTranslatedString,
  getSkill,
}: EquipmentDetailsModalProps) {
  if (!equipment) {
    return null
  }

  // Function to get quality background color
  const getQualityBgColor = (quality: string) => {
    switch (quality) {
      case "Orange":
        return "bg-gradient-to-br from-orange-500 to-red-500"
      case "Golden":
        return "bg-gradient-to-br from-yellow-500 to-amber-500"
      case "Purple":
        return "bg-gradient-to-br from-purple-500 to-indigo-500"
      case "Blue":
        return "bg-gradient-to-br from-blue-500 to-cyan-500"
      case "Green":
        return "bg-gradient-to-br from-green-500 to-emerald-500"
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-500"
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={(e) => {
        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
        onClose(e)
      }}
      title={
        <h3 className="text-lg font-bold neon-text">
          {getTranslatedString("equipment_details") || "Equipment Details"}
        </h3>
      }
      footer={
        <div className="flex justify-end">
          <button onClick={() => onClose()} className="neon-button px-4 py-2 rounded-lg text-sm">
            Close
          </button>
        </div>
      }
      maxWidth="max-w-md"
      closeOnOutsideClick={true} // 외부 클릭으로 닫히지 않도록 설정
    >
      <div className="p-4">
        <div className="flex mb-4">
          {/* Equipment Image */}
          <div
            className={`w-16 h-16 ${getQualityBgColor(equipment.quality)} rounded-lg mr-4 overflow-hidden neon-border flex items-center justify-center`}
          >
            {equipment.url ? (
              <img
                src={equipment.url || "/placeholder.svg"}
                alt={getTranslatedString(equipment.name)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  const textElement = document.createElement("span")
                  textElement.className = "text-xs text-center"
                  textElement.textContent = getTranslatedString(equipment.name).substring(0, 2)
                  e.currentTarget.parentElement?.appendChild(textElement)
                }}
              />
            ) : (
              <span className="text-xs text-center">{getTranslatedString(equipment.name).substring(0, 2)}</span>
            )}
          </div>

          {/* Equipment Info */}
          <div>
            <h4 className="text-base font-semibold neon-text">{getTranslatedString(equipment.name)}</h4>
            <p className="text-sm text-gray-400">
              {getTranslatedString(`equipment_type_${equipment.type}`) || equipment.type}
            </p>
          </div>
        </div>

        {/* Equipment Description - 포맷팅 적용 */}
        <div className="mb-4 character-detail-section">
          <h5 className="character-detail-section-title">
            {getTranslatedString("equipment_description") || "Description"}
          </h5>
          <p className="text-sm text-gray-300">{formatColorText(getTranslatedString(equipment.des))}</p>
        </div>

        {/* Equipment Effects - 스킬 리스트에서 효과 표시 */}
        {equipment.skillList && equipment.skillList.length > 0 && getSkill && (
          <div className="mb-4 character-detail-section">
            <h5 className="character-detail-section-title">{getTranslatedString("equipment_effects") || "Effects"}</h5>
            <div className="space-y-2">
              {equipment.skillList.map((skillItem, index) => {
                const skill = getSkill(skillItem.skillId)
                if (!skill) return null

                return (
                  <div key={index} className="text-sm text-gray-300">
                    {formatColorText(getTranslatedString(skill.description))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Equipment Acquisition Methods - 획득 방법 추가 */}
        {equipment.Getway && equipment.Getway.length > 0 && (
          <div className="mb-4 character-detail-section">
            <h5 className="character-detail-section-title">
              {getTranslatedString("equipment_acquisition") || "How to Obtain"}
            </h5>
            <ul className="space-y-1 list-disc list-inside">
              {equipment.Getway.map((method, index) => (
                <li key={index} className="text-sm text-gray-300">
                  {formatColorText(getTranslatedString(method.DisplayName))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
