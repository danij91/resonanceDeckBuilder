"use client"

import type { Card, CardExtraInfo } from "../types"
import React from "react"

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
  // Function to format text with color tags and other HTML tags
  const formatColorText = (text: string) => {
    if (!text) return ""

    // Remove newlines or replace with spaces
    const textWithoutNewlines = text.replace(/\n/g, " ")

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = textWithoutNewlines
      .replace(/<color=#([A-Fa-f0-9]{6})>/g, '<span style="color: #$1">')
      .replace(/<\/color>/g, "</span>")

    // Convert the DOM structure back to React elements
    const convertNodeToReact = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const childElements = Array.from(element.childNodes).map((child, i) => convertNodeToReact(child, i))

        if (element.tagName === "SPAN") {
          return (
            <span key={index} style={{ color: element.style.color }}>
              {childElements}
            </span>
          )
        }

        if (element.tagName === "I") {
          return <i key={index}>{childElements}</i>
        }

        if (element.tagName === "B") {
          return <b key={index}>{childElements}</b>
        }

        return <React.Fragment key={index}>{childElements}</React.Fragment>
      }

      return null
    }

    return Array.from(tempDiv.childNodes).map((node, i) => convertNodeToReact(node, i))
  }

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
      <div className="absolute top-0 right-0 px-0.5 py-0 text-white font-bold sm:text-3xl text-xs z-10">
        {extraInfo.cost}
      </div>

      {/* Amount badge - only show if amount > 0 */}
      {extraInfo.amount > 0 && (
        <div className="absolute top-0 left-0 px-1 py-0.5 bg-blue-600 bg-opacity-70 text-white font-bold sm:text-sm text-xs z-10 rounded-br-md">
          x{extraInfo.amount}
        </div>
      )}

      {/* Card content */}
      <div className="relative z-1 p-0 flex flex-col h-full">
        {/* Empty space in the middle */}
        <div className="flex-grow"></div>

        {/* 스킬 이미지 - 크기 증가 및 위치 조정 */}
        <div className="flex justify-center mb-2 lg:mb-8 mt-auto">
          <div className="w-1/2 relative">
            {" "}
            {/* 이미지 크기를 1/4에서 1/2로 증가 */}
            <div className="aspect-square transform rotate-45 overflow-hidden bg-black bg-opacity-30 border border-[hsla(var(--neon-white),0.5)] shadow-[0_0_5px_rgba(255,255,255,0.3)]">
              {extraInfo.img_url && (
                <img
                  src={extraInfo.img_url || "/placeholder.svg"}
                  alt={extraInfo.name}
                  className="object-cover absolute top-1/2 left-1/2 transform scale-150 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Card name - 두 줄까지 표시 가능하도록 수정 */}
        <div className="text-white font-bold lg:text-[1rem] text-[0.6rem] line-clamp-2 mt-auto neon-text user-select-none px-0.5 pb-0.5">
          {formatColorText(extraInfo.name)}
        </div>
      </div>
    </div>
  )
}

