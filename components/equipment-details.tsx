"use client"

import type { Equipment } from "../types"
import React from "react"

interface EquipmentDetailsProps {
  equipment: Equipment
  getTranslatedString: (key: string) => string
  onClose: () => void
}

export function EquipmentDetails({ equipment, getTranslatedString, onClose }: EquipmentDetailsProps) {
  if (!equipment) {
    return null
  }

  // Function to format text with color tags
  const formatColorText = (text: string) => {
    if (!text) return ""

    // Replace <color=#XXXXXX>text</color> with styled spans
    const formattedText = text.split(/(<color=#[A-Fa-f0-9]{6}>.*?<\/color>)/).map((part, index) => {
      const colorMatch = part.match(/<color=#([A-Fa-f0-9]{6})>(.*?)<\/color>/)
      if (colorMatch) {
        const [_, colorCode, content] = colorMatch
        return (
          <span key={index} style={{ color: `#${colorCode}` }}>
            {content}
          </span>
        )
      }

      // Handle newlines by replacing \n with <br />
      return part.split("\\n").map((line, i) =>
        i === 0 ? (
          line
        ) : (
          <React.Fragment key={`line-${index}-${i}`}>
            <br />
            {line}
          </React.Fragment>
        ),
      )
    })

    return formattedText
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 p-4 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">{getTranslatedString("equipment_details") || "Equipment Details"}</h3>

        <div className="flex mb-4">
          {/* Equipment Image */}
          <div className={`w-16 h-16 ${getQualityBgColor(equipment.quality)} rounded-lg mr-4 overflow-hidden`}>
            <img
              src={equipment.url || `/placeholder.svg?height=100&width=100`}
              alt={getTranslatedString(equipment.name)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Equipment Info */}
          <div>
            <h4 className="text-base font-semibold">{getTranslatedString(equipment.name)}</h4>
            <p className="text-sm text-gray-400">
              {getTranslatedString(`equipment_type_${equipment.type}`) || equipment.type}
            </p>
          </div>
        </div>

        {/* Equipment Description - 포맷팅 적용 */}
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-1">{getTranslatedString("equipment_description") || "Description"}</h5>
          <p className="text-sm text-gray-300">{formatColorText(getTranslatedString(equipment.des))}</p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
            {getTranslatedString("close") || "Close"}
          </button>
        </div>
      </div>
    </div>
  )
}

