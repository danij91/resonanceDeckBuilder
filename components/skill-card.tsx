"use client"

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
  card,
  extraInfo,
  getTranslatedString,
  onRemove,
  onEdit,
  isDisabled,
  characterImage,
}: SkillCardProps) {
  return (
    <div
      className="skill-card relative overflow-hidden h-full cursor-pointer"
      style={{ aspectRatio: "1/1.5" }}
      onClick={onEdit}
    >
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
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-red-900 bg-opacity-30">
          <div className="text-3xl text-red-500 transform rotate-60">🚫</div>
        </div>
      )}

      {/* Cost badge in top right - 새로운 디자인 */}
      <div className="skill-cost-badge">
        <span>{extraInfo.cost}</span>
      </div>

      {/* Card content */}
      <div className="relative z-1 p-3 flex flex-col h-full">
        {/* Empty space in the middle */}
        <div className="flex-grow"></div>

        {/* Diamond-shaped skill image at center */}
        <div className="flex justify-center mb-4">
          <div className="w-2/5 relative">
            <div className="aspect-square transform rotate-45 overflow-hidden bg-black bg-opacity-30 border border-[hsla(var(--neon-white),0.5)] shadow-[0_0_5px_rgba(255,255,255,0.3)]">
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
        <div className="text-white font-bold text-sm truncate mt-auto neon-text">
          {getTranslatedString(extraInfo.name)}
        </div>
      </div>
    </div>
  )
}

