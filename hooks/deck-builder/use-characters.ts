"use client"

import { useState, useCallback, useEffect } from "react"
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

  // 리더 설정 - 개선된 버전
  const setLeader = useCallback(
    (characterId: number) => {
      // 유효한 캐릭터인지 확인 (현재 선택된 캐릭터 목록에 있는지)
      if (selectedCharacters.includes(characterId)) {
        setLeaderCharacter(characterId)
      }
    },
    [selectedCharacters],
  )

  // 선택된 캐릭터 변경 시 리더 유효성 검사 및 자동 설정
  useEffect(() => {
    // 현재 리더가 선택된 캐릭터 목록에 없는 경우
    if (leaderCharacter !== -1 && !selectedCharacters.includes(leaderCharacter)) {
      // 선택된 캐릭터 중 첫 번째를 리더로 설정
      const validCharacters = selectedCharacters.filter((id) => id !== -1)
      setLeaderCharacter(validCharacters.length > 0 ? validCharacters[0] : -1)
    }
    // 리더가 없고 선택된 캐릭터가 있는 경우
    else if (leaderCharacter === -1) {
      const validCharacters = selectedCharacters.filter((id) => id !== -1)
      if (validCharacters.length > 0) {
        setLeaderCharacter(validCharacters[0])
      }
    }
  }, [selectedCharacters, leaderCharacter])

  return {
    selectedCharacters,
    setSelectedCharacters,
    leaderCharacter,
    setLeaderCharacter,
    getCharacter,
    setLeader,
  }
}

