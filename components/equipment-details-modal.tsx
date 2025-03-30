"use client"
import type { Equipment } from "../types"
import React from "react"
import { Modal } from "./ui/modal/Modal"

interface EquipmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: Equipment
  getTranslatedString: (key: string) => string
}

export function EquipmentDetailsModal({ isOpen, onClose, equipment, getTranslatedString }: EquipmentDetailsModalProps) {
  if (!equipment) {
    return null
  }

  // Function to format text with color tags
  const formatColorText = (text: string) => {
    if (!text) return ""

    // Replace <color=#XXXXXX>text</color> with styled spans
    const parts = text.split(/(<color=#[A-Fa-f0-9]{6}>.*?<\/color>)/)

    return parts.map((part, index) => {
      const colorMatch = part.match(/<color=#([A-Fa-f0-9]{6})>(.*?)<\/color>/)
      if (colorMatch) {
        const [_, colorCode, content] = colorMatch
        return (
          <span key={index} style={{ color: `#${colorCode}` }}>
            {content}
          </span>
        )
      }

      // Handle newlines
      if (part.includes("\n")) {
        const lines = part.split("\n")
        return (
          <React.Fragment key={index}>
            {lines.map((line, i) => (
              <React.Fragment key={`line-${index}-${i}`}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </React.Fragment>
        )
      }

      return part
    })
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
      onClose={onClose}
      title={
        <h3 className="text-lg font-bold neon-text">
          {getTranslatedString("equipment_details") || "Equipment Details"}
        </h3>
      }
      footer={
        <div className="flex justify-end">
          <button onClick={onClose} className="neon-button px-4 py-2 rounded-lg text-sm">
          {getTranslatedString("close")}
          </button>
        </div>
      }
      maxWidth="max-w-md"
    >
      <div className="p-4">
        <div className="flex mb-4">
          {/* Equipment Image */}
          <div
            className={`w-16 h-16 ${getQualityBgColor(equipment.quality)} rounded-lg mr-4 overflow-hidden neon-border`}
          >
            <img
              src={equipment.url || `/placeholder.svg?height=100&width=100`}
              alt={getTranslatedString(equipment.name)}
              className="w-full h-full object-cover"
            />
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
      </div>
    </Modal>
  )
}

