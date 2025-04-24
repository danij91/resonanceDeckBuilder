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

  // 카드 추가 함수 수정
  const addCard = useCallback(
    (
      cardId: string,
      sourceType: "character" | "equipment" | "passive",
      sourceId: string | number,
      sourceInfo?: {
        skillId?: number
        slotIndex?: number
        equipType?: "weapon" | "armor" | "accessory"
        ownerId?: number
      },
      skillIndex?:number
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
        const ownerId =
          sourceType === "equipment" ? 10000001 : sourceInfo?.ownerId !== undefined ? sourceInfo.ownerId : 10000001
        let skillId = -1

        // 소스 타입이 character 또는 passive인 경우
        if (sourceType === "character" || sourceType === "passive") {
          if (sourceInfo?.skillId) {
            skillId = sourceInfo.skillId
          }
        }

        // 카드 정보 가져오기
        const card = data?.cards[cardId]

        // 스킬 정보 가져오기
        let skillInfo = undefined
        if (skillId !== -1 && data?.skills) {
          const skill = data.skills[skillId.toString()]
          if (skill) {
            skillInfo = {
              name: skill.name,
              description: skill.description,
              detailDescription: skill.detailDescription,
              cardID: skill.cardID,
              leaderCardConditionDesc: skill.leaderCardConditionDesc,
            }
          } else if (card && data?.skills) {
            // 카드 ID로 스킬 찾기
            for (const sId in data.skills) {
              const skill = data.skills[sId]
              if (skill && skill.cardID && skill.cardID.toString() === cardId) {
                skillId = Number.parseInt(sId)
                skillInfo = {
                  name: skill.name,
                  description: skill.description,
                  detailDescription: skill.detailDescription,
                  cardID: skill.cardID,
                  leaderCardConditionDesc: skill.leaderCardConditionDesc,
                }
                break
              }
            }
          }
        }

        // 카드 추가 정보 생성
        let extraInfo = undefined
        if (card) {
          // 비용 계산
          let cost = 0
          if (card.cost_SN !== undefined) {
            cost = Math.floor(card.cost_SN / 10000)
          }

          // 수량 계산 (캐릭터의 skillList에서 찾기)
          let amount = 0
          if (skillId !== -1 && sourceType === "character" && typeof sourceId === "number") {
            const character = data?.characters[sourceId.toString()]
            if (character && character.skillList) {
              const skillItem = character.skillList.find((item) => item.skillId === skillId)
              if (skillItem && skillItem.num) {
                amount = skillItem.num
              }
            }
          }

          // 이미지 URL 찾기
          let img_url = undefined
          if (data?.images) {
            if (data.images[`card_${cardId}`]) {
              img_url = data.images[`card_${cardId}`]
            } else if (skillId !== -1 && data.images[`skill_${skillId}`]) {
              img_url = data.images[`skill_${skillId}`]
            }
          }

          extraInfo = {
            cost,
            amount,
            img_url,
            desc: skillInfo?.description || "",
          }
        }

        // 카드 정보 생성
        let cardInfo = undefined
        if (card) {
          cardInfo = {
            name: card.name,
            color: card.color,
            cardType: card.cardType,
            tagList: card.tagList,
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
                    // 스킬 정보가 없는 경우에만 추가
                    ...(skillInfo && !card.skillInfo && { skillInfo }),
                    // 카드 정보가 없는 경우에만 추가
                    ...(cardInfo && !card.cardInfo && { cardInfo }),
                    // 추가 정보가 없는 경우에만 추가
                    ...(extraInfo && !card.extraInfo && { extraInfo }),
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
            skillInfo,
            cardInfo,
            extraInfo,
            ...(skillIndex !== undefined ? { skillIndex } : {})
          },
        ]
      })
    },
    [setSelectedCards, data, hasSource],
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
