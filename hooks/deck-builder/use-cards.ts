"use client"

import { useState, useCallback, useRef } from "react"
import type { Database } from "../../types"
import type { SelectedCard, CardSource } from "./types"
import { getCardById, hasSource } from "./utils"

export function useCards(data: Database | null) {
  // 선택된 카드 참조 - 상태 업데이트 없이 현재 값에 접근하기 위함
  const selectedCardsRef = useRef<SelectedCard[]>([])

  // 선택된 카드 상태 업데이트 함수
  const [, setSelectedCardsState] = useState<SelectedCard[]>([])

  // 선택된 카드 업데이트 함수
  const setSelectedCards = useCallback((newCards: SelectedCard[] | ((prevCards: SelectedCard[]) => SelectedCard[])) => {
    if (typeof newCards === "function") {
      selectedCardsRef.current = newCards(selectedCardsRef.current)
    } else {
      selectedCardsRef.current = newCards
    }
    setSelectedCardsState(selectedCardsRef.current) // 상태 업데이트로 리렌더링 트리거
  }, [])

  // 카드 ID로 카드 정보 가져오기
  const getCard = useCallback(
    (id: string) => {
      return getCardById(data, id)
    },
    [data],
  )

  // 카드 정보 가져오기
  const getCardInfo = useCallback(
    (cardId: string) => {
      if (!data) return null
      const card = data.cards[cardId]
      if (!card) return null
      return { card }
    },
    [data],
  )

  // 장비에 의한 카드 추가 함수 수정
  const addCard = useCallback(
    (
      cardId: string,
      sourceType: "character" | "equipment" | "passive",
      sourceId: string | number,
      sourceInfo?: {
        skillId?: number
        slotIndex?: number
        equipType?: "weapon" | "armor" | "accessory"
        ownerId?: number // 명시적 ownerId 파라미터 추가
      },
    ) => {
      setSelectedCards((prev) => {
        // 기존 카드 찾기
        const existingCard = prev.find((card) => card.id === cardId)

        // 새 소스 객체 생성
        const newSource: CardSource = {
          type: sourceType,
          id: sourceId,
          ...sourceInfo,
        } as CardSource

        // ownerId 결정
        // 장비에 의한 스킬은 항상 ownerId를 10000001로 설정
        const ownerId =
          sourceType === "equipment" ? 10000001 : sourceInfo?.ownerId !== undefined ? sourceInfo.ownerId : 10000001
        let skillId = -1

        // 소스 타입이 character 또는 passive인 경우 (기존 로직 유지)
        if (sourceType === "character" || sourceType === "passive") {
          if (sourceInfo?.skillId) {
            skillId = sourceInfo.skillId
          }
        }

        if (existingCard) {
          // 이미 같은 소스가 있는지 확인
          if (!hasSource(existingCard, newSource)) {
            // 새 소스 추가
            return prev.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    sources: [...card.sources, newSource],
                    ...(ownerId !== -1 && { ownerId }),
                    ...(skillId !== -1 && { skillId }),
                  }
                : card,
            )
          }
          return prev // 소스가 이미 있으면 변경 없음
        }

        // 새 카드 추가
        return [
          ...prev,
          {
            id: cardId,
            useType: 1,
            useParam: -1,
            ownerId,
            skillId: skillId !== -1 ? skillId : undefined,
            sources: [newSource],
          },
        ]
      })
    },
    [setSelectedCards],
  )

  // 카드 제거
  const removeCard = useCallback(
    (cardId: string) => {
      setSelectedCards((prev) => prev.filter((card) => card.id !== cardId))
    },
    [setSelectedCards],
  )

  // 카드 순서 변경
  const reorderCards = useCallback(
    (fromIndex: number, toIndex: number) => {
      setSelectedCards((prev) => {
        const result = [...prev]
        const [removed] = result.splice(fromIndex, 1)
        result.splice(toIndex, 0, removed)
        return result
      })
    },
    [setSelectedCards],
  )

  // 카드 설정 업데이트
  const updateCardSettings = useCallback(
    (cardId: string, useType: number, useParam: number, useParamMap?: Record<string, number>) => {
      setSelectedCards((currentCards) => {
        return currentCards.map((card) => (card.id === cardId ? { ...card, useType, useParam, useParamMap } : card))
      })
    },
    [setSelectedCards],
  )

  return {
    selectedCards: selectedCardsRef.current,
    setSelectedCards,
    getCard,
    getCardInfo,
    addCard,
    removeCard,
    reorderCards,
    updateCardSettings,
  }
}
