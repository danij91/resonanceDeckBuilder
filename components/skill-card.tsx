"use client"

import { Edit } from "lucide-react"
import type { Card, CardExtraInfo } from "../types"

interface SkillCardProps {
  card: Card
  extraInfo: CardExtraInfo
  getTranslatedString: (key: string) => string
  onRemove: () => void
  onEdit: () => void
  isDisabled: boolean
  characterImage?: string
}

export function SkillCard({
  extraInfo,
  getTranslatedString,
  onRemove,
  onEdit,
  isDisabled,
  characterImage,
}: SkillCardProps) {
  return (
    <div className="relative rounded-lg overflow-hidden h-full" style={{ aspectRatio: "1/1.5" }}>
      {/* Card background */}
      <div className="absolute inset-0 w-full h-full">
        {characterImage ? (
          <img src={characterImage || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900"></div>
        )}
      </div>

      {/* Card overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-40">
          <div className="text-3xl text-red-500 transform rotate-45">🚫</div>
        </div>
      )}

      {/* Cost badge in top right */}
      <div className="absolute top-2 right-2 z-20">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">{extraInfo.cost}</span>
        </div>
      </div>

      {/* Card content */}
      <div className="relative z-1 p-3 flex flex-col h-full">
        {/* Empty space where header was */}
        <div className="flex-grow"></div>

        {/* Diamond-shaped skill image at bottom center */}
        <div className="flex justify-center mb-2">
          <div className="w-2/5 relative">
            <div className="aspect-square transform rotate-45 overflow-hidden bg-black bg-opacity-30">
              {extraInfo.img_url && (
                <img
                  src={extraInfo.img_url || "/placeholder.svg"}
                  alt={getTranslatedString(extraInfo.name)}
                  className="object-cover absolute top-1/2 left-1/2 transform scale-150 -translate-x-1/2 -translate-y-1/2 -rotate-45"
                />
              )}
            </div>
          </div>
        </div>

        {/* Card name at bottom left */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-white font-bold text-sm truncate max-w-[80%]">{getTranslatedString(extraInfo.name)}</div>

          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log("Edit button clicked")
              onEdit()
            }}
            className="text-white hover:text-blue-300 z-20"
            aria-label={getTranslatedString("edit") || "Edit"}
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

