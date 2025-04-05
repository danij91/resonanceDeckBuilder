"use client"

import { useState, useCallback } from "react"
import type { BattleSettings } from "./types"

export function useBattle() {
  // 전투 설정
  const [battleSettings, setBattleSettingsState] = useState<BattleSettings>({
    isLeaderCardOn: true,
    isSpCardOn: true,
    keepCardNum: 0,
    discardType: 0,
    otherCard: 0,
  })

  // 전투 설정 업데이트
  const updateBattleSettings = useCallback((settings: Partial<BattleSettings>) => {
    setBattleSettingsState((prev) => ({ ...prev, ...settings }))
  }, [])

  return {
    battleSettings,
    updateBattleSettings,
  }
}

