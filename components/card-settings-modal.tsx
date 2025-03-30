"use client"
import { useState } from "react"
import type { Card, CardExtraInfo } from "../types"
import { ChevronLeft, ChevronRight, PlusIcon as MoreThan, MinusIcon as LessThan, Equal } from "lucide-react"
import React from "react"
import { Modal } from "./ui/modal/Modal"

interface CardSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  card: Card
  extraInfo: CardExtraInfo
  initialUseType: number
  initialUseParam: number
  initialUseParamMap?: Record<string, number>
  onSave: (cardId: string, useType: number, useParam: number, useParamMap?: Record<string, number>) => void
  getTranslatedString: (key: string) => string
  characterImage?: string
}

export function CardSettingsModal({
  isOpen,
  onClose,
  card,
  extraInfo,
  initialUseType,
  initialUseParam,
  initialUseParamMap = {},
  onSave,
  getTranslatedString,
  characterImage,
}: CardSettingsModalProps) {
  const [useType, setUseType] = useState(initialUseType)
  const [useParam, setUseParam] = useState(initialUseParam)
  const [useParamMap, setUseParamMap] = useState<Record<string, number>>(initialUseParamMap)

  // Function to format text with color tags
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

  // 숫자 입력값 변경 핸들러
  const handleParamChange = (optionIndex: number, value: number, minNum: number, maxNum: number) => {
    // 범위 내로 값 조정
    let adjustedValue = value
    if (value < minNum) adjustedValue = minNum
    if (value > maxNum) adjustedValue = maxNum

    // 상태 업데이트 - Use option index as key, not condId
    const newParamMap = {
      ...useParamMap,
      [optionIndex.toString()]: adjustedValue,
    }

    setUseParamMap(newParamMap)

    // 현재 선택된 옵션이 이 파라미터를 사용하는 경우 즉시 저장
    if (useType === optionIndex) {
      setUseParam(adjustedValue)
      onSave(card.id.toString(), useType, adjustedValue, newParamMap)
    }
  }

  // 아이콘 렌더링 함수
  const renderIcon = (iconText: string | undefined) => {
    if (!iconText) return null

    switch (iconText) {
      case "<=":
        return (
          <span className="flex items-center">
            <LessThan className="w-4 h-4 mr-1" />=
          </span>
        )
      case ">=":
        return (
          <span className="flex items-center">
            <MoreThan className="w-4 h-4 mr-1" />=
          </span>
        )
      case "<":
        return <LessThan className="w-4 h-4" />
      case ">":
        return <MoreThan className="w-4 h-4" />
      case "=":
        return <Equal className="w-4 h-4" />
      default:
        return <span>{iconText}</span>
    }
  }

  // 옵션 선택 시 호출되는 함수
  const handleOptionSelect = (newUseType: number, paramValue = -1) => {
    setUseType(newUseType)
    setUseParam(paramValue)

    // 즉시 저장 적용 (창은 닫히지 않음)
    onSave(card.id.toString(), newUseType, paramValue, useParamMap)
  }

  // ExCondList와 ExActList에서 사용할 아이콘 매핑
  const getIconForCondition = (typeEnum: string | undefined) => {
    if (!typeEnum) return undefined

    switch (typeEnum.toLowerCase()) {
      case "less":
        return "<"
      case "lessequal":
        return "<="
      case "greater":
        return ">"
      case "greaterequal":
        return ">="
      case "equal":
        return "="
      default:
        return undefined
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 className="text-lg font-bold neon-text">{getTranslatedString("skill_details") || "Skill Details"}</h2>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <button onClick={onClose} className="neon-button px-4 py-2 rounded-lg text-sm">
          {getTranslatedString("close")}
          </button>
        </div>
      }
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-grow overflow-hidden" style={{ backgroundColor: "var(--modal-content-bg)" }}>
        {/* 왼쪽 - 카드 정보 */}
        <div
          className="w-3/5 p-4 border-r border-[hsl(var(--neon-white),0.3)] overflow-y-auto"
          style={{ backgroundColor: "var(--modal-content-bg)" }}
        >
          <div className="flex mb-4">
            {/* 카드 이미지 */}
            <div className="w-24 h-24 bg-black border border-[hsl(var(--neon-white),0.3)] rounded-md overflow-hidden mr-4">
              {extraInfo.img_url && (
                <img
                  src={extraInfo.img_url || "/placeholder.svg"}
                  alt={getTranslatedString(extraInfo.name)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              {/* 카드 이름과 비용 */}
              <div className="border-b border-[hsl(var(--neon-white),0.3)] pb-2 mb-2">
                <div className="text-xl font-bold neon-text">{getTranslatedString(extraInfo.name)}</div>
                <div className="flex items-center mt-1">
                  <span className="text-gray-400 mr-2">{getTranslatedString("cost") || "Cost"}</span>
                  <span className="text-[hsl(var(--neon-white))] text-2xl font-bold">{extraInfo.cost}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {getTranslatedString("amount") || "Amount"}: {extraInfo.amount}
                </div>
              </div>
            </div>
          </div>

          {/* 카드 설명 - 포맷팅 적용 */}
          <div className="text-gray-300 mb-4">{formatColorText(getTranslatedString(extraInfo.desc))}</div>
        </div>

        {/* 오른쪽 - 사용 설정 */}
        <div className="w-2/5 p-4 overflow-y-auto" style={{ backgroundColor: "var(--modal-content-bg)" }}>
          <h3 className="text-lg font-medium mb-4 neon-text">
            {getTranslatedString("usage_settings") || "Usage Settings"}
          </h3>

          <div className="space-y-3">
            {/* 즉시 사용 옵션 */}
            <div
              className={`skill-option ${useType === 1 ? "skill-option-selected" : "skill-option-unselected"}`}
              onClick={() => handleOptionSelect(1)}
            >
              <div className="font-medium">{getTranslatedString("use_immediately") || "Use Immediately"}</div>
            </div>

            {/* 사용 안함 옵션 */}
            <div
              className={`skill-option ${useType === 2 ? "skill-option-selected" : "skill-option-unselected"}`}
              onClick={() => handleOptionSelect(2)}
            >
              <div className="font-medium">{getTranslatedString("do_not_use") || "Do Not Use"}</div>
            </div>

            {/* ExCondList 기반 조건 옵션 */}
            {card.ExCondList &&
              card.ExCondList.map((cond, index) => {
                // Calculate option index (starting from 3 after the default options)
                const optionIndex = index + 3
                const isNumCond = cond.isNumCond === true
                const minNum = cond.minNum || 0
                const maxNum = cond.interValNum && cond.numDuration ? (cond.interValNum - 1) * cond.numDuration : 100
                const step = cond.numDuration || 1

                // 현재 값 계산 - Use option index as key, not condId
                const currentValue =
                  useParamMap[optionIndex.toString()] !== undefined ? useParamMap[optionIndex.toString()] : minNum

                // 언어팩 키 생성
                const textKey = `text_${cond.des}`

                return (
                  <div
                    key={`cond-${optionIndex}`}
                    className={`skill-option ${useType === optionIndex ? "skill-option-selected" : "skill-option-unselected"}`}
                    onClick={() => handleOptionSelect(optionIndex, currentValue)}
                  >
                    <div className="flex items-center">
                      <div className="font-medium flex items-center">
                        {/* 텍스트 */}
                        <span>{getTranslatedString(textKey) || textKey}</span>

                        {/* 아이콘 */}
                        {cond.typeEnum && (
                          <span className="mx-1">{renderIcon(getIconForCondition(cond.typeEnum))}</span>
                        )}

                        {/* 숫자 입력 (isNumCond가 true인 경우) */}
                        {isNumCond && (
                          <div className="ml-2 flex items-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="w-6 h-6 bg-black bg-opacity-20 rounded-l flex items-center justify-center"
                              onClick={() => handleParamChange(optionIndex, currentValue - step, minNum, maxNum)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 font-bold">{currentValue}%</span>
                            <button
                              className="w-6 h-6 bg-black bg-opacity-20 rounded-r flex items-center justify-center"
                              onClick={() => handleParamChange(optionIndex, currentValue + step, minNum, maxNum)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

            {/* ExActList 기반 액션 옵션 - 카드에 ExActList가 있는 경우 추가 */}
            {card.ExActList &&
              card.ExActList.map((act, index) => {
                // Calculate option index (starting after ExCondList options)
                const condListLength = card.ExCondList?.length || 0
                const optionIndex = index + 3 + condListLength

                // 언어팩 키 생성
                const textKey = `text_${act.des}`

                return (
                  <div
                    key={`act-${optionIndex}`}
                    className={`skill-option ${useType === optionIndex ? "skill-option-selected" : "skill-option-unselected"}`}
                    onClick={() => handleOptionSelect(optionIndex)}
                  >
                    <div className="flex items-center">
                      <div className="font-medium flex items-center">
                        {/* 텍스트 */}
                        <span>{getTranslatedString(textKey) || textKey}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

