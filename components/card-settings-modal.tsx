"use client"
import { useState } from "react"
import type { Card, CardExtraInfo, SpecialControl } from "../types"
import { ChevronLeft, ChevronRight, PlusIcon as MoreThan, MinusIcon as LessThan, Equal } from "lucide-react"

interface CardSettingsModalProps {
  card: Card
  extraInfo: CardExtraInfo
  initialUseType: number
  initialUseParam: number
  initialUseParamMap?: Record<string, number>
  onSave: (cardId: string, useType: number, useParam: number, useParamMap?: Record<string, number>) => void
  onClose: () => void
  getTranslatedString: (key: string) => string
  specialControls: Record<string, SpecialControl>
  characterImage?: string
}

export function CardSettingsModal({
  card,
  extraInfo,
  initialUseType,
  initialUseParam,
  initialUseParamMap = {},
  onSave,
  onClose,
  getTranslatedString,
  specialControls,
  characterImage,
}: CardSettingsModalProps) {
  const [useType, setUseType] = useState(initialUseType)
  const [useParam, setUseParam] = useState(initialUseParam)
  const [useParamMap, setUseParamMap] = useState<Record<string, number>>(initialUseParamMap)

  const hasSpecialCtrl = !!extraInfo.specialCtrl && extraInfo.specialCtrl.length > 0

  // 숫자 입력값 변경 핸들러
  const handleParamChange = (key: string, value: number) => {
    // 최소값과 최대값 범위 내에서 값 제한
    const control = specialControls[key]
    if (control && control.minimum !== undefined && control.maximum !== undefined) {
      const min = Number.parseInt(control.minimum)
      const max = Number.parseInt(control.maximum)

      // 범위 내로 값 조정
      let adjustedValue = value
      if (value < min) adjustedValue = min
      if (value > max) adjustedValue = max

      // 상태 업데이트
      const newParamMap = {
        ...useParamMap,
        [key]: adjustedValue,
      }

      setUseParamMap(newParamMap)

      // 현재 선택된 옵션이 이 파라미터를 사용하는 경우 즉시 저장
      if (useType === Number.parseInt(key) + 3) {
        onSave(card.id, useType, adjustedValue, newParamMap)
      }
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
  const handleOptionSelect = (newUseType: number) => {
    setUseType(newUseType)

    // 특수 조건에 대한 useParam 계산
    let finalUseParam = -1

    if (hasSpecialCtrl && newUseType > 2) {
      const controlKey = (newUseType - 3).toString()
      const control = specialControls[controlKey]

      if (control && control.minimum !== undefined && control.maximum !== undefined) {
        finalUseParam = useParamMap[controlKey] || Number.parseInt(control.minimum || "0")
      }
    }

    // 즉시 저장 적용 (창은 닫히지 않음)
    onSave(card.id, newUseType, finalUseParam, useParamMap)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="bg-blue-600 p-3 flex items-center">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2 className="text-lg font-bold text-white">{getTranslatedString("skill_details") || "Skill Details"}</h2>
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* 왼쪽 - 카드 정보 */}
          <div className="w-3/5 p-4 border-r border-gray-700 overflow-y-auto">
            <div className="flex mb-4">
              {/* 카드 이미지 */}
              <div className="w-24 h-24 bg-gray-700 rounded-md overflow-hidden mr-4">
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
                <div className="border-b border-gray-600 pb-2 mb-2">
                  <div className="text-xl font-bold">{getTranslatedString(extraInfo.name)}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-gray-400 mr-2">{getTranslatedString("cost") || "Cost"}</span>
                    <span className="text-yellow-500 text-2xl font-bold">{extraInfo.cost}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {getTranslatedString("amount") || "Amount"}: {extraInfo.amount}
                  </div>
                </div>
              </div>
            </div>

            {/* 카드 설명 */}
            <div className="text-gray-300 mb-4">{getTranslatedString(extraInfo.desc)}</div>
          </div>

          {/* 오른쪽 - 사용 설정 */}
          <div className="w-2/5 p-4 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">{getTranslatedString("usage_settings") || "Usage Settings"}</h3>

            <div className="space-y-3">
              {/* 즉시 사용 옵션 */}
              <div
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between
                  ${useType === 1 ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
                onClick={() => handleOptionSelect(1)}
              >
                <div className="font-medium">{getTranslatedString("use_immediately") || "Use Immediately"}</div>
                {useType === 1 && (
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12L10 17L19 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* 사용 안함 옵션 */}
              <div
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between
                  ${useType === 2 ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
                onClick={() => handleOptionSelect(2)}
              >
                <div className="font-medium">{getTranslatedString("do_not_use") || "Do Not Use"}</div>
                {useType === 2 && (
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12L10 17L19 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* 특수 조건 옵션 - 해당 카드의 specialCtrl 배열에 있는 값들만 표시 */}
              {extraInfo.specialCtrl &&
                extraInfo.specialCtrl.map((ctrlKey) => {
                  const key = ctrlKey
                  const control = specialControls[key]

                  if (!control) return null

                  const hasNumericInput = control.minimum !== undefined && control.maximum !== undefined
                  const currentUseType = Number.parseInt(key) + 3
                  const currentValue = useParamMap[key] || (control.minimum ? Number.parseInt(control.minimum) : 0)

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg cursor-pointer flex items-center justify-between
                      ${useType === currentUseType ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
                      onClick={() => handleOptionSelect(currentUseType)}
                    >
                      <div className="flex items-center">
                        <div className="font-medium flex items-center">
                          {/* 텍스트 */}
                          <span>{getTranslatedString(control.text) || control.text}</span>

                          {/* 아이콘 */}
                          {control.icon && <span className="mx-1">{renderIcon(control.icon)}</span>}

                          {/* 숫자 입력 */}
                          {hasNumericInput && (
                            <div className="ml-2 flex items-center">
                              <button
                                className="w-6 h-6 bg-black bg-opacity-20 rounded-l flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const min = control.minimum ? Number.parseInt(control.minimum) : 0
                                  handleParamChange(key, Math.max(min, currentValue - 1))
                                }}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="px-2 font-bold">{currentValue}%</span>
                              <button
                                className="w-6 h-6 bg-black bg-opacity-20 rounded-r flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const max = control.maximum ? Number.parseInt(control.maximum) : 100
                                  handleParamChange(key, Math.min(max, currentValue + 1))
                                }}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {useType === currentUseType && (
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-yellow-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 12L10 17L19 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
            {getTranslatedString("close") || "Close"}
          </button>
        </div>
      </div>
    </div>
  )
}

