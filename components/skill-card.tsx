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
      style={{
        aspectRatio: "1/1.5",
        maxWidth: "100%",
        width: "100%",
      }}
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

      {/* Cost badge - 더 작게 만들기 */}
      <div className="absolute top-0 right-0 px-0.5 py-0 text-white font-bold text-xs z-10">{extraInfo.cost}</div>

      {/* Card content */}
      <div className="relative z-1 p-0 flex flex-col h-full">
        {/* Empty space in the middle */}
        <div className="flex-grow"></div>

        {/* 스킬 이미지 - 크기 증가 및 위치 조정 */}
        <div className="flex justify-center mb-0 mt-auto">
          <div className="w-1/2 relative">
            {" "}
            {/* 이미지 크기를 1/4에서 1/2로 증가 */}
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

        {/* Card name - 두 줄까지 표시 가능하도록 수정 */}
        <div className="text-white font-bold text-[0.6rem] line-clamp-2 mt-auto neon-text user-select-none px-0.5 pb-0.5">
          {getTranslatedString(extraInfo.name)}
        </div>
      </div>
    </div>
  )
}

