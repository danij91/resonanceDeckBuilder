"use client"

import { useState, useCallback } from "react"
import type { AwakeningInfo } from "./types"

export function useAwakening() {
  // 각 캐릭터의 각성 단계 상태
  const [awakening, setAwakening] = useState<AwakeningInfo>({})

  // 각성 단계 설정
  const setCharacterAwakening = useCallback((characterId: number, stage: number | null) => {
    setAwakening((prev) => {
      const newAwakening = { ...prev }

      if (stage === null) {
        // 각성 단계 제거 (선택 취소)
        delete newAwakening[characterId]
      } else {
        // 각성 단계 설정
        newAwakening[characterId] = stage
      }

      return newAwakening
    })
  }, [])

  // 캐릭터 제거 시 각성 정보도 제거
  const removeCharacterAwakening = useCallback((characterId: number) => {
    setAwakening((prev) => {
      const newAwakening = { ...prev }
      delete newAwakening[characterId]
      return newAwakening
    })
  }, [])

  // 모든 각성 정보 초기화
  const clearAllAwakening = useCallback(() => {
    setAwakening({})
  }, [])

  return {
    awakening,
    setAwakening,
    setCharacterAwakening,
    removeCharacterAwakening,
    clearAllAwakening,
  }
}

