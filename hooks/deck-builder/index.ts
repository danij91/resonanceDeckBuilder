"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Database } from "../../types"
import type { SelectedCard, Result } from "./types"
import { useCharacters } from "./use-characters"
import { useCards } from "./use-cards"
import { useEquipment } from "./use-equipment"
import { useBattle } from "./use-battle"
import { usePresets } from "./use-presets"
import { useAwakening } from "./use-awakening" // 각성 훅 추가
import { getSkillById, isExcludedSkill, getAvailableCardIds } from "./utils"

export function useDeckBuilder(data: Database | null) {
  // 다크 모드
  const [isDarkMode, setIsDarkMode] = useState(true)

  // 캐릭터 관리
  const { selectedCharacters, setSelectedCharacters, leaderCharacter, setLeaderCharacter, getCharacter, setLeader } =
    useCharacters(data)

  // 카드 관리
  const {
    selectedCards,
    setSelectedCards,
    getCard,
    getCardInfo,
    addCard,
    removeCard,
    reorderCards,
    updateCardSettings,
  } = useCards(data)

  // 장비 관리
  const { equipment, setEquipment, getEquipment, allEquipments } = useEquipment(data)

  // 전투 설정
  const { battleSettings, updateBattleSettings } = useBattle()

  // 각성 관리 추가
  const { awakening, setAwakening, setCharacterAwakening, removeCharacterAwakening, clearAllAwakening } = useAwakening()

  // 스킬 정보 가져오기
  const getSkill = useCallback(
    (skillId: number) => {
      return getSkillById(data, skillId)
    },
    [data],
  )

  // 다크 모드 토글
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  // 다크 모드 클래스 적용
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // 모든 상태 초기화
  const clearAll = useCallback(() => {
    setSelectedCharacters([-1, -1, -1, -1, -1])
    setLeaderCharacter(-1)
    setSelectedCards([])
    updateBattleSettings({
      isLeaderCardOn: true,
      isSpCardOn: true,
      keepCardNum: 0,
      discardType: 0,
      otherCard: 0,
    })
    setEquipment(Array(5).fill({ weapon: null, armor: null, accessory: null }))
    clearAllAwakening() // 각성 정보 초기화 추가
  }, [
    setSelectedCharacters,
    setLeaderCharacter,
    setSelectedCards,
    updateBattleSettings,
    setEquipment,
    clearAllAwakening,
  ])

  // 캐릭터의 스킬 목록을 기반으로 카드를 생성하는 함수
  const generateCardsFromSkills = useCallback(
    (characterId: number) => {
      if (!data) {
        return
      }

      const character = data.characters[characterId.toString()]
      if (!character) {
        return
      }

      // 처리된 스킬 ID를 추적하기 위한 Set
      const processedSkills = new Set<number>()

      // 스킬 처리 함수
      const processSkill = (skillId: number, isPassive = false) => {
        // 이미 처리한 스킬은 건너뛰기
        if (processedSkills.has(skillId)) return
        processedSkills.add(skillId)

        // 제외된 스킬 ID 목록에 있는지 확인
        if (isExcludedSkill(data, skillId)) {
          return
        }

        const skill = getSkill(skillId)
        if (!skill) return

        // 스킬에 cardID가 있으면 카드 추가
        if (skill.cardID) {
          const cardId = skill.cardID.toString()
          addCard(cardId, isPassive ? "passive" : "character", characterId, { skillId })
        }

        // ExSkillList 처리
        if (skill.ExSkillList && skill.ExSkillList.length > 0) {
          skill.ExSkillList.forEach((exSkill) => {
            const exSkillId = exSkill.ExSkillName
            processSkill(exSkillId, isPassive)
          })
        }
      }

      // 캐릭터의 일반 스킬 처리
      if (character.skillList) {
        character.skillList.forEach((skillItem) => {
          processSkill(skillItem.skillId)
        })
      }

      // 캐릭터의 패시브 스킬 처리
      if (character.passiveSkillList) {
        character.passiveSkillList.forEach((skillItem) => {
          processSkill(skillItem.skillId, true)
        })
      }
    },
    [data, getSkill, addCard],
  )

  // 장비의 스킬 목록을 기반으로 카드를 생성하는 함수
  const generateCardsFromEquipment = useCallback(
    (equipId: string, slotIndex: number, equipType: "weapon" | "armor" | "accessory") => {
      if (!data || !data.equipments) {
        return
      }

      const equip = data.equipments[equipId]
      if (!equip || !equip.skillList || equip.skillList.length === 0) {
        return
      }

      // 처리된 스킬 ID를 추적하기 위한 Set
      const processedSkills = new Set<number>()

      // 장비의 모든 스킬 처리
      equip.skillList.forEach((skillItem) => {
        const skillId = skillItem.skillId
        const skill = getSkill(skillId)

        if (!skill) return

        // 스킬 자체에 cardID가 있으면 카드 추가
        if (skill.cardID) {
          const cardId = skill.cardID.toString()
          addCard(cardId, "equipment", equipId, { skillId, slotIndex, equipType })
        }

        // 스킬의 ExSkillList 처리
        if (skill.ExSkillList && skill.ExSkillList.length > 0) {
          skill.ExSkillList.forEach((exSkillItem) => {
            const exSkillId = exSkillItem.ExSkillName

            // 이미 처리한 스킬은 건너뛰기
            if (processedSkills.has(exSkillId)) return
            processedSkills.add(exSkillId)

            // 제외된 스킬 ID 목록에 있는지 확인
            if (isExcludedSkill(data, exSkillId)) {
              return
            }

            // ExSkill 정보 가져오기
            const exSkill = getSkill(exSkillId)
            if (!exSkill) return

            // ExSkill에 cardID가 있으면 카드 추가
            if (exSkill.cardID) {
              const cardId = exSkill.cardID.toString()
              addCard(cardId, "equipment", equipId, { skillId: exSkillId, slotIndex, equipType })
            }
          })
        }
      })
    },
    [data, getSkill, addCard],
  )

  // 장비 관련 카드 제거 함수
  const removeCardsFromEquipment = useCallback(
    (equipId: string, slotIndex: number, equipType: "weapon" | "armor" | "accessory") => {
      setSelectedCards((prev) => {
        // 각 카드의 소스 목록에서 해당 장비 소스만 제거
        const updatedCards = prev.map((card) => {
          const updatedSources = card.sources.filter(
            (source) =>
              !(
                source.type === "equipment" &&
                source.id === equipId &&
                source.slotIndex === slotIndex &&
                source.equipType === equipType
              ),
          )

          return {
            ...card,
            sources: updatedSources,
          }
        })

        // 소스가 없는 카드는 제거
        return updatedCards.filter((card) => card.sources.length > 0)
      })
    },
    [setSelectedCards],
  )

  // 캐릭터 제거 후 카드 업데이트
  const updateCardsAfterCharacterRemoval = useCallback(
    (removedCharacterId: number) => {
      setSelectedCards((prev) => {
        // 각 카드의 소스 목록에서 제거된 캐릭터 소스만 제거
        const updatedCards = prev.map((card) => {
          const updatedSources = card.sources.filter(
            (source) =>
              !(source.type === "character" && source.id === removedCharacterId) &&
              !(source.type === "passive" && source.id === removedCharacterId),
          )

          return {
            ...card,
            sources: updatedSources,
          }
        })

        // 소스가 없는 카드는 제거
        return updatedCards.filter((card) => card.sources.length > 0)
      })
    },
    [setSelectedCards],
  )

  // 캐릭터 추가
  const addCharacter = useCallback(
    (characterId: number, slot: number) => {
      if (slot < 0 || slot >= 5) return

      setSelectedCharacters((prev) => {
        const newSelection = [...prev]
        newSelection[slot] = characterId
        return newSelection
      })

      // 캐릭터의 스킬 목록을 기반으로 카드 생성
      generateCardsFromSkills(characterId)
    },
    [generateCardsFromSkills, setSelectedCharacters],
  )

  // 캐릭터 제거
  const removeCharacter = useCallback(
    (slot: number) => {
      if (slot < 0 || slot >= 5) return

      const characterId = selectedCharacters[slot]

      // 장비 정보 저장 (제거 전)
      const slotEquipment = equipment[slot]

      setSelectedCharacters((prev) => {
        const newSelection = [...prev]
        newSelection[slot] = -1
        return newSelection
      })

      // 장비 제거 및 관련 카드 제거
      setEquipment((prev) => {
        const newEquipment = [...prev]

        // 각 장비 타입별로 처리
        if (slotEquipment.weapon) {
          removeCardsFromEquipment(slotEquipment.weapon, slot, "weapon")
        }
        if (slotEquipment.armor) {
          removeCardsFromEquipment(slotEquipment.armor, slot, "armor")
        }
        if (slotEquipment.accessory) {
          removeCardsFromEquipment(slotEquipment.accessory, slot, "accessory")
        }

        newEquipment[slot] = { weapon: null, armor: null, accessory: null }
        return newEquipment
      })

      // 캐릭터 제거 후 카드 업데이트
      updateCardsAfterCharacterRemoval(characterId)

      // 캐릭터 제거 시 각성 정보도 제거
      removeCharacterAwakening(characterId)
    },
    [
      selectedCharacters,
      equipment,
      removeCardsFromEquipment,
      updateCardsAfterCharacterRemoval,
      setSelectedCharacters,
      setEquipment,
      removeCharacterAwakening,
    ],
  )

  // 장비 업데이트
  const updateEquipment = useCallback(
    (slotIndex: number, equipType: "weapon" | "armor" | "accessory", equipId: string | null) => {
      setEquipment((prev) => {
        const newEquipment = [...prev]
        const oldEquipId = newEquipment[slotIndex][equipType]

        // 이전 장비가 있었다면 관련 카드 제거
        if (oldEquipId) {
          removeCardsFromEquipment(oldEquipId, slotIndex, equipType)
        }

        // 새 장비 설정
        newEquipment[slotIndex] = {
          ...newEquipment[slotIndex],
          [equipType]: equipId,
        }

        // 새 장비가 있다면 관련 카드 추가
        if (equipId) {
          generateCardsFromEquipment(equipId, slotIndex, equipType)
        }

        return newEquipment
      })
    },
    [removeCardsFromEquipment, generateCardsFromEquipment],
  )

  // 각성 단계 업데이트
  const updateAwakening = useCallback(
    (characterId: number, stage: number | null) => {
      setCharacterAwakening(characterId, stage)
    },
    [setCharacterAwakening],
  )

  // 프리셋 객체 가져오기
  const importPresetObject = useCallback(
    (preset: any, isUrlImport = false): Result => {
      try {
        // 프리셋 구조 검증
        if (!preset.roleList || !Array.isArray(preset.roleList) || preset.roleList.length !== 5) {
          throw new Error("Invalid roleList")
        }

        if (!preset.cardList || !Array.isArray(preset.cardList)) {
          throw new Error("Invalid cardList")
        }

        // 모든 상태 초기화
        clearAll()

        // 로컬 변수로 업데이트된 상태 추적
        const updatedCharacters = [-1, -1, -1, -1, -1]
        const updatedEquipment = Array(5).fill({ weapon: null, armor: null, accessory: null })

        // 캐릭터 설정
        preset.roleList.forEach((charId: number, index: number) => {
          if (charId !== -1) {
            addCharacter(charId, index)
            updatedCharacters[index] = charId
          }
        })

        // 리더 설정 - 모든 캐릭터 추가 후 명시적으로 설정
        // 프리셋의 header가 유효한 캐릭터인지 확인
        if (preset.header !== -1 && preset.roleList.includes(preset.header)) {
          // 상태 업데이트 큐에 추가하여 모든 캐릭터 추가 후 실행되도록 함
          setTimeout(() => {
            // forceSet 옵션을 true로 설정하여 리더 강제 설정
            setLeader(preset.header, true)
          }, 100) // 지연 시간을 100ms로 증가
        }

        // 각성 정보 설정 (있는 경우)
        if (preset.awakening) {
          setAwakening(preset.awakening)
        }

        // 장비 설정
        if (preset.equipment) {
          Object.entries(preset.equipment).forEach(([slotIndex, equipData]) => {
            const index = Number.parseInt(slotIndex, 10)
            if (index >= 0 && index < 5 && Array.isArray(equipData) && equipData.length === 3) {
              const [weapon, armor, accessory] = equipData as [string | null, string | null, string | null]

              // 로컬 변수 업데이트
              updatedEquipment[index] = {
                weapon: weapon || null,
                armor: armor || null,
                accessory: accessory || null,
              }

              // 실제 상태 업데이트
              if (weapon) updateEquipment(index, "weapon", weapon)
              if (armor) updateEquipment(index, "armor", armor)
              if (accessory) updateEquipment(index, "accessory", accessory)
            }
          })
        }

        // 장비 타입별로 다음에 사용할 캐릭터 슬롯 인덱스를 추적하는 맵
        const equipmentTypeSlotMap = {
          weapon: 0,
          armor: 0,
          accessory: 0,
        }

        // 유효한 캐릭터 슬롯 인덱스 배열 (캐릭터가 있는 슬롯만)
        const validCharacterSlots = updatedCharacters
          .map((charId, index) => (charId !== -1 ? index : -1))
          .filter((index) => index !== -1)

        // 이미 장착된 장비 ID를 추적하는 Set
        const equippedItems = new Set<string>()

        // 캐릭터 슬롯이 없으면 처리 중단
        if (validCharacterSlots.length === 0) return { success: true, message: "import_success" }

        // URL 임포트가 아닌 경우에만 cardList의 equipIdList 처리
        // 이 부분이 핵심 변경 사항입니다
        if (!isUrlImport) {
          console.log(isUrlImport)
          // 카드의 equipIdList 처리
          preset.cardList.forEach((presetCard: any) => {
            if (presetCard.equipIdList && Array.isArray(presetCard.equipIdList) && presetCard.equipIdList.length > 0) {
              // 각 장비 ID에 대해 처리
              presetCard.equipIdList.forEach((equipId: string) => {
                // 이미 장착된 장비는 건너뛰기
                if (equippedItems.has(equipId)) return

                // 장비 정보 가져오기
                const equipmentData = data?.equipments?.[equipId]
                if (!equipmentData) return

                // 장비 타입 확인
                const equipType = equipmentData.type as "weapon" | "armor" | "accessory"
                if (!equipType) return

                // 해당 장비가 실제로 이 카드의 스킬을 추가하는지 확인
                let isValidEquipment = false

                // 장비의 스킬 목록 확인
                if (equipmentData.skillList) {
                  for (const skillItem of equipmentData.skillList) {
                    const skill = getSkill(skillItem.skillId)

                    // ExSkillList 확인
                    if (skill && skill.ExSkillList) {
                      for (const exSkill of skill.ExSkillList) {
                        const exSkillData = getSkill(exSkill.ExSkillName)
                        if (exSkillData && exSkillData.cardID && exSkillData.cardID.toString() === presetCard.id) {
                          isValidEquipment = true
                          break
                        }
                      }
                      if (isValidEquipment) break
                    }
                  }
                }

                // 유효한 장비라면 순서대로 캐릭터 슬롯에 장착
                if (isValidEquipment) {
                  // 현재 장비 타입에 대한 슬롯 인덱스 가져오기
                  let slotIndex = equipmentTypeSlotMap[equipType]

                  // 모든 캐릭터 슬롯을 순회했다면 다시 처음부터 시작
                  if (slotIndex >= validCharacterSlots.length) {
                    slotIndex = 0
                    equipmentTypeSlotMap[equipType] = 0
                  }

                  // 실제 캐릭터 슬롯 인덱스 가져오기
                  const charSlotIndex = validCharacterSlots[slotIndex]

                  // 장비 장착
                  updateEquipment(charSlotIndex, equipType, equipId)

                  // 로컬 변수 업데이트
                  updatedEquipment[charSlotIndex] = {
                    ...updatedEquipment[charSlotIndex],
                    [equipType]: equipId,
                  }

                  // 장착된 장비 Set에 추가
                  equippedItems.add(equipId)

                  // 다음 슬롯 인덱스로 업데이트
                  equipmentTypeSlotMap[equipType]++
                }
              })
            }
          })
        }

        // 카드 설정 업데이트 (useType, useParam 등)
        setSelectedCards((currentCards) => {
          // 1. 프리셋의 cardList에 있는 모든 카드를 일단 추가
          const newCards: SelectedCard[] = []

          // 프리셋의 카드 목록을 처리하여 새 카드 배열 생성
          preset.cardList.forEach((presetCard: any) => {
            const cardId = presetCard.id

            // 현재 카드 목록에서 해당 ID를 가진 카드 찾기
            const existingCard = currentCards.find((card) => card.id === cardId)

            if (existingCard) {
              // 기존 카드가 있으면 설정만 업데이트
              newCards.push({
                ...existingCard,
                useType: presetCard.useType,
                useParam: presetCard.useParam,
                useParamMap: presetCard.useParamMap || {},
              })
            } else {
              // 기존 카드가 없으면 새로 생성
              newCards.push({
                id: cardId,
                useType: presetCard.useType,
                useParam: presetCard.useParam,
                useParamMap: presetCard.useParamMap || {},
                ownerId: presetCard.ownerId,
                skillId: presetCard.skillId,
                skillIndex: presetCard.skillIndex,
                sources: [], // 빈 소스 배열로 시작
              })
            }
          })

          // 2. 프리셋의 cardList에 없는 카드 중 현재 선택된 카드 목록에 있는 카드 추가
          const presetCardIds = new Set(preset.cardList.map((card: any) => card.id))

          currentCards.forEach((card) => {
            // 이미 추가되지 않은 카드만 추가
            if (!presetCardIds.has(card.id)) {
              newCards.push(card)
            }
          })

          // 3. 사용할 수 없는 카드 식별 및 교체
          if (data) {
            // 공통 유틸리티 함수 사용
            const availableCardIds = getAvailableCardIds(data, preset.roleList, equipment)
            // 사용할 수 없는 카드 식별
            const unavailableCards = newCards.filter((card) => !availableCardIds.has(card.id))

            // 사용할 수 없는 카드들에 대해 이름 매칭을 통한 대체 카드 찾기
            const currentLanguage = "ko"
            unavailableCards.forEach((unavailableCard) => {
              // 스킬 ID가 있으면 해당 스킬의 이름 찾기
              if (unavailableCard.skillId && data.skills[unavailableCard.skillId]) {
                const unavailableSkill = data.skills[unavailableCard.skillId]
                // 언어팩에서 번역된 스킬 이름 가져오기
                const translatedUnavailableSkillName =
                  data.languages && data.languages[currentLanguage]
                    ? data.languages[currentLanguage][unavailableSkill.name] || unavailableSkill.name
                    : unavailableSkill.name

                // 사용 가능한 카드들 중에서 같은 이름을 가진 카드 찾기
                for (const availableCardId of availableCardIds) {
                  // 해당 카드의 스킬 ID 찾기
                  let foundSkillId: number | undefined

                  // 카드에 연결된 스킬 찾기
                  for (const skillId in data.skills) {
                    const skill = data.skills[skillId]
                    if (skill.cardID && skill.cardID.toString() === availableCardId) {
                      foundSkillId = Number(skillId)
                      break
                    }
                  }

                  if (foundSkillId) {
                    const availableSkill = data.skills[foundSkillId.toString()]
                    if (availableSkill) {
                      // 언어팩에서 번역된 사용 가능한 스킬 이름 가져오기
                      const translatedAvailableSkillName =
                        data.languages && data.languages[currentLanguage]
                          ? data.languages[currentLanguage][availableSkill.name] || availableSkill.name
                          : availableSkill.name

                      // 번역된 이름으로 비교
                      if (translatedAvailableSkillName === translatedUnavailableSkillName) {
                        const index = newCards.findIndex((card) => card.id === availableCardId)
                        if (index !== -1) {
                          newCards.splice(index, 1) // 인덱스 위치에서 1개의 원소를 삭제
                        }

                        // 이름이 일치하는 카드 발견, 카드 정보 교체
                        unavailableCard.id = availableCardId
                        unavailableCard.skillId = foundSkillId

                        // 카드의 ownerId 업데이트
                        const cardData = data.cards[availableCardId]
                        if (cardData && cardData.ownerId) {
                          unavailableCard.ownerId = cardData.ownerId
                        }

                        // 특수 스킬 확인 (specialSkillIds에 있는 경우)
                        if (data.specialSkillIds && data.specialSkillIds.includes(foundSkillId)) {
                          unavailableCard.ownerId = 10000001 // 특수 스킬의 경우 ownerId를 10000001로 설정
                        }

                        console.log(`카드 교체: ${unavailableSkill.name} -> ${availableSkill.name}`)
                        break
                      }
                    }
                  }
                }
              }
            })
          }

          return newCards
        })

        // 전투 설정 업데이트
        updateBattleSettings({
          isLeaderCardOn: preset.isLeaderCardOn !== undefined ? preset.isLeaderCardOn : true,
          isSpCardOn: preset.isSpCardOn !== undefined ? preset.isSpCardOn : true,
          keepCardNum: preset.keepCardNum !== undefined ? preset.keepCardNum : 0,
          discardType: preset.discardType !== undefined ? preset.discardType - 1 : 0, // discardType에서 1 빼기
          otherCard: preset.otherCard !== undefined ? preset.otherCard : 0,
        })

        return { success: true, message: "import_success" }
      } catch (error) {
        return { success: false, message: "import_failed" }
      }
    },
    [
      addCharacter,
      setLeader,
      updateEquipment,
      clearAll,
      setSelectedCards,
      data,
      getSkill,
      selectedCharacters,
      equipment,
      updateBattleSettings,
      setAwakening,
    ],
  )

  // 프리셋 관리
  const {
    exportPreset,
    exportPresetToString,
    importPreset,
    decodePresetString,
    createShareableUrl,
    createRootShareableUrl,
    createPresetObject,
  } = usePresets(
    data,
    selectedCharacters,
    leaderCharacter,
    selectedCards,
    battleSettings,
    equipment,
    awakening, // 각성 정보 추가
    clearAll,
    importPresetObject,
  )

  // 사용 가능한 카드 목록
  const availableCards = useMemo(() => {
    if (!data) return []

    // 공통 유틸리티 함수 사용
    const cardIds = getAvailableCardIds(data, selectedCharacters, equipment)

    // 선택된 카드에서 모든 카드 ID 추가
    selectedCards.forEach((card) => {
      cardIds.add(card.id)
    })

    // 배열로 변환
    return Array.from(cardIds)
      .map((id) => {
        const card = data.cards[id]
        if (!card) return null
        return { card }
      })
      .filter(Boolean)
  }, [data, selectedCharacters, equipment, selectedCards])

  return {
    selectedCharacters,
    leaderCharacter,
    selectedCards,
    battleSettings,
    equipment,
    isDarkMode,
    availableCards,
    awakening, // 각성 정보 추가
    getCharacter,
    getCard,
    getCardInfo,
    getEquipment,
    getSkill,
    allEquipments,
    addCharacter,
    removeCharacter,
    setLeader,
    addCard,
    removeCard,
    reorderCards,
    updateCardSettings,
    updateBattleSettings,
    updateEquipment,
    updateAwakening, // 각성 업데이트 함수 추가
    toggleDarkMode,
    clearAll,
    exportPreset,
    exportPresetToString,
    importPreset,
    importPresetObject,
    createShareableUrl,
    createRootShareableUrl,
    decodePresetString,
  }
}

