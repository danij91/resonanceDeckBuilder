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
      className="skill-card relative overflow-hidden h-full cursor-pointer user-select-none"
      style={{ aspectRatio: "1/1.5" }}
      onClick={(e) => {
        e.stopPropagation()
        onEdit()
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {/* Card background */}
      <div className="absolute inset-0 w-full h-full">
        {characterImage ? (
          <img
            src={characterImage || "/placeholder.svg"}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              e.currentTarget.src = "images/placeHolder Card.jpg"
            }}
          />
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

      {/* Cost badge - 원형 배경 제거하고 오른쪽 위에 바짝 붙이기 */}
      <div className="absolute top-0 right-0 px-2 py-1 text-white font-bold text-lg z-10">{extraInfo.cost}</div>

      {/* Card content */}
      <div className="relative z-1 p-2 flex flex-col h-full">
        {/* Empty space in the middle */}
        <div className="flex-grow"></div>

        {/* 스킬 이미지 - 크기 조정 */}
        <div className="flex justify-center mb-2">
          <div className="w-3/5 relative">
            <div className="aspect-square transform rotate-45 overflow-hidden bg-black bg-opacity-30 border border-[hsla(var(--neon-white),0.5)] shadow-[0_0_5px_rgba(255,255,255,0.3)]">
              {extraInfo.img_url && (
                <img
                  src={extraInfo.img_url || "/placeholder.svg"}
                  alt={getTranslatedString(extraInfo.name)}
                  className="object-cover absolute top-1/2 left-1/2 transform scale-150 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Card name - 두 줄까지 표시하고 패딩 제거 */}
        <div className="text-white font-bold skill-card-name mt-auto neon-text user-select-none">
          {getTranslatedString(extraInfo.name)}
        </div>
      </div>
    </div>
  )
}
