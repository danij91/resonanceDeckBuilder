"use client"

import { useCallback } from "react"
import type { Database } from "../../types"
import type { SelectedCard, PresetCard, Preset, EquipmentSlot, Result, AwakeningInfo } from "./types"
import { encodePreset, decodePreset, encodePresetForUrl } from "../../utils/presetCodec"

export function usePresets(
  data: Database | null,
  selectedCharacters: number[],
  leaderCharacter: number,
  selectedCards: SelectedCard[],
  battleSettings: {
    isLeaderCardOn: boolean
    isSpCardOn: boolean
    keepCardNum: number
    discardType: number
    otherCard: number
  },
  equipment: EquipmentSlot[],
  awakening: AwakeningInfo, // 각성 정보 추가
  clearAll: () => void,
  importPresetObject: (preset: any) => Result,
) {
  // 프리셋 객체 생성
  const createPresetObject = useCallback(
    (includeEquipment = false, includeAwakening = false) => {
      // 선택된 카드를 필요한 형식으로 변환
      const formattedCardList = selectedCards.map((card) => {
        // 기본 카드 객체 생성
        const cardObj: PresetCard = {
          id: card.id,
          ownerId: card.ownerId || -1,
          skillId: card.skillId || -1,
          skillIndex: card.skillIndex || -1,
          targetType: 0,
          useType: card.useType,
          useParam: card.useParam,
          useParamMap: card.useParamMap || {},
          equipIdList: [],
        }

        // 장비 소스 정보 추가
        if (card.sources) {
          const equipmentSources = card.sources.filter((source) => source.type === "equipment")
          if (equipmentSources.length > 0) {
            cardObj.equipIdList = equipmentSources.map((source) => source.id.toString())
          }
        }

        // skillId가 없는 경우에만 데이터에서 찾아서 설정
        if (cardObj.skillId === -1 && data) {
          const cardData = data.cards[card.id]

          if (cardData) {
            // 해당 카드 ID를 가진 스킬 찾기
            let foundSkillId = -1
            for (const skillId in data.skills) {
              const skill = data.skills[skillId]
              if (skill.cardID && skill.cardID.toString() === card.id) {
                foundSkillId = Number.parseInt(skillId)
                cardObj.skillId = foundSkillId
                break
              }
            }

            // 특수 스킬인지 확인
            const isSpecialSkill =
              data.specialSkillIds && foundSkillId > 0 && data.specialSkillIds.includes(foundSkillId)

            if (isSpecialSkill) {
              cardObj.ownerId = 10000001
            }

            // skillIndex 설정
            if (cardObj.skillIndex === -1 && cardObj.ownerId > 0 && foundSkillId > 0) {
              const character = data.characters[cardObj.ownerId.toString()]
              if (character && character.skillList) {
                const skillIndex = character.skillList.findIndex((s) => s.skillId === foundSkillId)
                if (skillIndex !== -1) {
                  cardObj.skillIndex = skillIndex + 1
                }
              }
            }
          }
        }

        // skillIndex가 -1이면 제거
        if (cardObj.skillIndex === -1) {
          delete cardObj.skillIndex
        }

        return cardObj
      })

      // 카드 ID 맵 생성
      const cardIdMap: Record<string, number> = {}
      selectedCards.forEach((card) => {
        cardIdMap[card.id] = 1
      })

      // 기본 프리셋 객체 생성
      const preset: Preset = {
        roleList: selectedCharacters,
        header: leaderCharacter,
        cardList: formattedCardList,
        cardIdMap: cardIdMap,
        isLeaderCardOn: battleSettings.isLeaderCardOn,
        isSpCardOn: battleSettings.isSpCardOn,
        keepCardNum: battleSettings.keepCardNum,
        discardType: battleSettings.discardType + 1, // discardType에 +1
        otherCard: battleSettings.otherCard,
      }

      // 장비 정보 포함 여부
      if (includeEquipment) {
        // 장비 정보 생성
        const equipmentData: Record<number, [string | null, string | null, string | null]> = {}

        // 캐릭터가 있는 슬롯에 대해서만 장비 정보 추가
        selectedCharacters.forEach((charId, index) => {
          if (charId !== -1) {
            const charEquipment = equipment[index]
            if (charEquipment.weapon || charEquipment.armor || charEquipment.accessory) {
              equipmentData[index] = [charEquipment.weapon, charEquipment.armor, charEquipment.accessory]
            }
          }
        })

        // 장비 정보가 있는 경우에만 추가
        if (Object.keys(equipmentData).length > 0) {
          preset.equipment = equipmentData
        }
      }

      // 각성 정보 포함 여부
      if (includeAwakening && Object.keys(awakening).length > 0) {
        preset.awakening = awakening
      }

      return preset
    },
    [selectedCharacters, leaderCharacter, selectedCards, battleSettings, equipment, awakening, data],
  )

  // 프리셋 내보내기
  const exportPreset = useCallback(() => {
    try {
      const preset = createPresetObject(false, false) // 장비 정보와 각성 정보 제외
      const base64String = encodePreset(preset)
      navigator.clipboard.writeText(base64String)
      return { success: true, message: "export_success" }
    } catch (error) {
      return { success: false, message: "export_failed" }
    }
  }, [createPresetObject])

  // 프리셋을 문자열로 내보내기
  const exportPresetToString = useCallback(() => {
    try {
      const preset = createPresetObject(false, false) // 장비 정보 각성 정보 제외
      return encodePreset(preset)
    } catch (error) {
      return ""
    }
  }, [createPresetObject])

  // 클립보드에서 프리셋 가져오기
  const importPreset = useCallback(async () => {
    try {
      const base64Text = await navigator.clipboard.readText()

      // 프리셋 디코딩
      const preset = decodePreset(base64Text)

      if (!preset) {
        throw new Error("invalid_preset_format")
      }

      // 프리셋 구조 검증
      if (!preset.roleList || !Array.isArray(preset.roleList) || preset.roleList.length !== 5) {
        throw new Error("invalid_rolelist")
      }

      if (!preset.cardList || !Array.isArray(preset.cardList)) {
        throw new Error("invalid_cardlist")
      }

      // 리더 설정 부분 제거 - importPresetObject에서 처리하도록 함
      // if (preset.header !== -1 && preset.roleList.includes(preset.header)) {
      //   Promise.resolve().then(() => {
      //     setLeaderCharacter(preset.header);
      //   });
      // }

      // 프리셋 객체 가져오기
      return importPresetObject(preset)
    } catch (error) {
      return { success: false, message: "import_failed" }
    }
  }, [importPresetObject])

  // 프리셋 문자열 디코딩
  const decodePresetString = useCallback((base64Text: string) => {
    try {
      const preset = decodePreset(base64Text)

      if (!preset) {
        return null
      }

      // 프리셋 구조 검증
      if (!preset.roleList || !Array.isArray(preset.roleList) || preset.roleList.length !== 5) {
        return null
      }

      if (!preset.cardList || !Array.isArray(preset.cardList)) {
        return null
      }

      return preset
    } catch (error) {
      console.error("Error decoding preset:", error)
      return null
    }
  }, [])

  // 공유 URL 생성
  const createShareableUrl = useCallback(() => {
    try {
      const preset = createPresetObject(true, true) // 장비 정보와 각성 정보 포함
      const encodedPreset = encodePresetForUrl(preset)

      // 현재 URL에서 기본 경로 가져오기
      const baseUrl = window.location.origin
      const langPath = window.location.pathname.split("/")[1] || "ko"

      // 공유 URL 생성
      const shareableUrl = `${baseUrl}/${langPath}?code=${encodedPreset}`
      return { success: true, url: shareableUrl }
    } catch (error) {
      return { success: false, url: "" }
    }
  }, [createPresetObject])

  // 루트 공유 URL 생성
  const createRootShareableUrl = useCallback(() => {
    try {
      const preset = createPresetObject(true, true) // 장비 정보와 각성 정보 포함
      const encodedPreset = encodePresetForUrl(preset)

      // 루트 URL 가져오기
      const rootUrl = window.location.origin

      // 공유 URL 생성
      const shareableUrl = `${rootUrl}?code=${encodedPreset}`
      return { success: true, url: shareableUrl }
    } catch (error) {
      return { success: false, url: "" }
    }
  }, [createPresetObject])

  return {
    exportPreset,
    exportPresetToString,
    importPreset,
    decodePresetString,
    createShareableUrl,
    createRootShareableUrl,
    createPresetObject,
  }
}

