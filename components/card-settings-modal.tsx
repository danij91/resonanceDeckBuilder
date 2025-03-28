"use client"
import { useState } from "react"
import type { Card, CardExtraInfo, SpecialControl } from "../types"
import { ChevronLeft, ChevronRight, Equal } from "lucide-react"

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

  // 매핑 함수: useType → ctrlKey
  const useTypeToCtrlKey = (useType: number): string => {
    const index = useType - 3
    return extraInfo.specialCtrl?.[index] ?? ""
  }

  // 매핑 함수: ctrlKey → useType
  const ctrlKeyToUseType = (ctrlKey: string): number => {
    const index = extraInfo.specialCtrl?.indexOf(ctrlKey) ?? -1
    return index >= 0 ? 3 + index : -1
  }

  // 숫자 입력값 변경 핸들러
  const handleParamChange = (ctrlKey: string, value: number) => {
    const control = specialControls[ctrlKey]
    if (!control) return
  
    const min = Number.parseInt(control.minimum || "0")
    const max = Number.parseInt(control.maximum || "100")
    const adjustedValue = Math.min(Math.max(value, min), max)
  
    const useTypeKey = ctrlKeyToUseType(ctrlKey)
  
    const newParamMap = {
      ...useParamMap,
      [useTypeKey]: adjustedValue,
    }
  
    setUseParamMap(newParamMap)
  
    if (useType === useTypeKey) {
      onSave(card.id, useType, adjustedValue, newParamMap)
    }
  }

  // 옵션 선택 핸들러
  const handleOptionSelect = (newUseType: number) => {
    setUseType(newUseType)
  
    let finalUseParam = -1
    if (hasSpecialCtrl && newUseType >= 3) {
      finalUseParam = useParamMap[newUseType] ?? (() => {
        const ctrlKey = useTypeToCtrlKey(newUseType)
        const control = specialControls[ctrlKey]
        return control?.minimum ? Number.parseInt(control.minimum) : 0
      })()
    }
  
    onSave(card.id, newUseType, finalUseParam, useParamMap)
  }

  // 아이콘 렌더링
  const renderIcon = (iconText: string | undefined) => {
    if (!iconText) return null
    switch (iconText) {
      case "<=":
        return <span className="text-3xl font-extrabold font-mono">≤</span>
      case ">=":
        return <span className="text-3xl font-extrabold font-mono">≥</span>
      case "<":
        return <span className="text-3xl font-extrabold font-mono">&lt;</span>
      case ">":
        return <span className="text-3xl font-extrabold font-mono">&gt;</span>
      case "=":
        return <Equal className="w-4 h-4" />
      default:
        return <span>{iconText}</span>
    }
  }

  return (
    <div
    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    onClick={onClose} // 배경 클릭 시 닫기
  >
    <div
      className="bg-gray-800 rounded-lg max-w-3xl w-full flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
    >
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
                <div className="border-b border-gray-600 pb-2 mb-2">
                  <div className="text-xl font-bold">{getTranslatedString(extraInfo.name)}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-gray-400 mr-2">{getTranslatedString("cost")}</span>
                    <span className="text-yellow-500 text-2xl font-bold">{extraInfo.cost}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {getTranslatedString("amount")}: {extraInfo.amount}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-gray-300 mb-4">{getTranslatedString(extraInfo.desc)}</div>
          </div>

          {/* 오른쪽 - 설정 */}
          <div className="w-2/5 p-4 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">{getTranslatedString("usage_settings")}</h3>
            <div className="space-y-3">
              {/* 즉시 사용 */}
              <div className={`p-3 rounded-lg cursor-pointer flex items-center justify-between
                ${useType === 1 ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
                onClick={() => handleOptionSelect(1)}
              >
                <div className="font-medium">{getTranslatedString("use_immediately")}</div>
                {useType === 1 && <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>}
              </div>

              {/* 사용 안함 */}
              <div className={`p-3 rounded-lg cursor-pointer flex items-center justify-between
                ${useType === 2 ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
                onClick={() => handleOptionSelect(2)}
              >
                <div className="font-medium">{getTranslatedString("do_not_use")}</div>
                {useType === 2 && <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>}
              </div>

              {/* 특수 조건들 */}
              {extraInfo.specialCtrl?.map((ctrlKey, index) => {
                const currentUseType = 3 + index
                const control = specialControls[ctrlKey]
                if (!control) return null

                const hasNumericInput = control.minimum !== undefined && control.maximum !== undefined
                const currentValue = useParamMap[currentUseType] ?? Number.parseInt(control.minimum ?? "0")

                return (
                  <div key={ctrlKey}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between
                      ${useType === currentUseType ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
                    onClick={() => handleOptionSelect(currentUseType)}
                  >
                    <div className="flex items-center font-medium">
                      <span>{getTranslatedString(control.text)}</span>
                      {control.icon && <span className="mx-1">{renderIcon(control.icon)}</span>}

                      {hasNumericInput && (
                        <div className="ml-2 flex items-center">
                        <button
                          className="w-6 h-6 bg-black bg-opacity-20 rounded-l flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleParamChange(ctrlKey, currentValue - 1)
                          }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      
                        <input
                          className="w-12 text-center bg-transparent font-bold outline-none border-none text-sm"
                          value={currentValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value, 10)
                            if (!isNaN(parsed)) {
                              handleParamChange(ctrlKey, parsed)
                            }
                          }}
                        />
                      
                        <button
                          className="w-6 h-6 bg-black bg-opacity-20 rounded-r flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleParamChange(ctrlKey, currentValue + 1)
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      )}
                    </div>

                    {useType === currentUseType && (
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            {getTranslatedString("close")}
          </button>
        </div>
      </div>
    </div>
  )
}
