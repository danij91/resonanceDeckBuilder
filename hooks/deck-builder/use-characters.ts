"use client"

import { useState, useCallback } from "react"
import type { Database } from "../../types"
import { getCharacterById } from "./utils"

export function useCharacters(data: Database | null) {
  // 캐릭터 선택 (5 슬롯, -1은 빈 슬롯)
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([-1, -1, -1, -1, -1])

  // 리더 캐릭터
  const [leaderCharacter, setLeaderCharacter] = useState<number>(-1)

  // 캐릭터 ID로 캐릭터 정보 가져오기
  const getCharacter = useCallback(
    (id: number) => {
      return getCharacterById(data, id)
    },
    [data],
  )

  // 리더 설정
  const setLeader = useCallback(
    (characterId: number) => {
      if (selectedCharacters.includes(characterId)) {
        setLeaderCharacter(characterId)
      }
    },
    [selectedCharacters],
  )

  return {
    selectedCharacters,
    setSelectedCharacters,
    leaderCharacter,
    setLeaderCharacter,
    getCharacter,
    setLeader,
  }
}

