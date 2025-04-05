"use client"

import { useState, useCallback, useMemo } from "react"
import type { Database } from "../../types"
import type { EquipmentSlot } from "./types"
import { getEquipmentById } from "./utils"

export function useEquipment(data: Database | null) {
  // 각 캐릭터 슬롯의 장비
  const [equipment, setEquipment] = useState<EquipmentSlot[]>(
    Array(5).fill({ weapon: null, armor: null, accessory: null }),
  )

  // 장비 ID로 장비 정보 가져오기
  const getEquipment = useCallback(
    (equipId: string) => {
      return getEquipmentById(data, equipId)
    },
    [data],
  )

  // 모든 장비 목록
  const allEquipments = useMemo(() => {
    if (!data || !data.equipments) return []
    return Object.values(data.equipments)
  }, [data])

  return {
    equipment,
    setEquipment,
    getEquipment,
    allEquipments,
  }
}

