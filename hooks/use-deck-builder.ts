"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import type { Database, Skill } from "../types"
import { encodePreset, decodePreset, encodePresetForUrl } from "../utils/presetCodec"

export interface PresetCard {
  id: string
  ownerId: number
  skillId: number
  skillIndex: number
  targetType: number
  useType: number
  useParam: number
  useParamMap: Record<string, number>
  equipIdList: string[]
}

// Define the type for selected cards
type SelectedCard = {
  id: string
  useType: number
  useParam: number
  useParamMap?: Record<string, number>
  ownerId?: number
  skillId?: number
  skillIndex?: number
  sources: Array<{
    type: "character" | "equipment" | "passive"
    id: number | string
    skillId?: number
    slotIndex?: number
    equipType?: "weapon" | "armor" | "accessory"
  }>
}

export function useDeckBuilder(data: Database | null) {
  // Use useRef to hold the state of selectedCards
  const selectedCardsRef = useRef<SelectedCard[]>([])

  // useState for the setter function of selectedCards
  const [, setSelectedCardsState] = useState<SelectedCard[]>([])

  // Function to update selectedCards
  const setSelectedCards = useCallback((newCards: SelectedCard[] | ((prevCards: SelectedCard[]) => SelectedCard[])) => {
    if (typeof newCards === "function") {
      selectedCardsRef.current = newCards(selectedCardsRef.current)
    } else {
      selectedCardsRef.current = newCards
    }
    setSelectedCardsState(selectedCardsRef.current) // Update state to trigger re-renders
  }, [])

  // Character selection (5 slots, -1 means empty)
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([-1, -1, -1, -1, -1])

  // Leader character
  const [leaderCharacter, setLeaderCharacter] = useState<number>(-1)

  // Battle settings
  const [battleSettings, setBattleSettings] = useState({
    isLeaderCardOn: true,
    isSpCardOn: true,
    keepCardNum: 0,
    discardType: 0,
    otherCard: 0,
  })

  // Equipment for each character slot
  const [equipment, setEquipment] = useState<
    Array<{
      weapon: string | null
      armor: string | null
      accessory: string | null
    }>
  >(Array(5).fill({ weapon: null, armor: null, accessory: null }))

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  // Get character by ID
  const getCharacter = useCallback(
    (id: number) => {
      if (!data || id === -1) return null
      return data.characters[id.toString()]
    },
    [data],
  )

  // Get card by ID
  const getCard = useCallback(
    (id: string) => {
      if (!data) return null
      return data.cards[id]
    },
    [data],
  )

  // Get card info by ID
  const getCardInfo = useCallback(
    (cardId: string) => {
      if (!data) return null
      const card = data.cards[cardId]
      if (!card) return null
      return { card }
    },
    [data],
  )

  // Get skill by ID
  const getSkill = useCallback(
    (skillId: number): Skill | null => {
      if (!data) return null
      return data.skills[skillId.toString()] || null
    },
    [data],
  )

  // Add card to selection with source information
  const addCard = useCallback(
    (
      cardId: string,
      sourceType: "character" | "equipment" | "passive",
      sourceId: string | number,
      sourceInfo?: {
        skillId?: number
        slotIndex?: number
        equipType?: "weapon" | "armor" | "accessory"
      },
    ) => {
      setSelectedCards((prev) => {
        // Find existing card
        const existingCard = prev.find((card) => card.id === cardId)

        // Create new source object
        const newSource = {
          type: sourceType,
          id: sourceId,
          ...sourceInfo,
        }

        // 즉시 ownerId 결정 - createPresetObject의 알고리즘 사용
        let ownerId = -1
        let skillId = -1

        // 1. 소스 타입이 character 또는 passive인 경우 해당 캐릭터 ID를 ownerId로 설정
        if (sourceType === "character" || sourceType === "passive") {
          ownerId = Number(sourceId)
          if (sourceInfo?.skillId) {
            skillId = sourceInfo.skillId
          }
        }

        // 2. 카드 데이터에서 ownerId 찾기 (아직 결정되지 않은 경우)
        if (ownerId === -1 && data) {
          const cardData = data.cards[cardId]
          if (cardData && cardData.ownerId) {
            ownerId = cardData.ownerId
          }
        }

        // 3. 특수 스킬 확인 (specialSkillIds에 있는 경우)
        if (sourceInfo?.skillId && data?.specialSkillIds && data.specialSkillIds.includes(sourceInfo.skillId)) {
          ownerId = 10000001 // 특수 스킬의 경우 ownerId를 10000001로 설정
        }

        if (existingCard) {
          // Check if this exact source already exists
          const sourceExists = existingCard.sources.some(
            (source) =>
              source.type === newSource.type &&
              source.id === newSource.id &&
              source.skillId === newSource.skillId &&
              source.slotIndex === newSource.slotIndex &&
              source.equipType === newSource.equipType,
          )

          if (!sourceExists) {
            // Add new source to existing card
            return prev.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    sources: [...card.sources, newSource],
                    // ownerId가 -1이 아닌 경우에만 업데이트
                    ...(ownerId !== -1 && { ownerId }),
                    ...(skillId !== -1 && { skillId }),
                  }
                : card,
            )
          }
          return prev // No change needed if source already exists
        }

        // Add new card with source and ownerId
        return [
          ...prev,
          {
            id: cardId,
            useType: 1,
            useParam: -1,
            ownerId, // 즉시 ownerId 설정
            skillId: skillId !== -1 ? skillId : undefined,
            sources: [newSource],
          },
        ]
      })
    },
    [setSelectedCards, data],
  )

  // Get all available cards for selected characters
  const availableCards = useMemo(() => {
    if (!data) return []

    const cardSet = new Set<string>()
    const validCharacters = selectedCharacters.filter((id) => id !== -1)

    // 모든 카드 순회
    Object.values(data.cards).forEach((card) => {
      // 카드 소유자 확인
      if (card.ownerId && validCharacters.includes(card.ownerId)) {
        cardSet.add(card.id.toString())
      }
    })

    // 스킬에서 카드 ID 찾기
    validCharacters.forEach((charId) => {
      const character = data.characters[charId.toString()]
      if (character && character.skillList) {
        character.skillList.forEach((skillItem) => {
          const skill = data.skills[skillItem.skillId.toString()]
          if (skill && skill.cardID) {
            cardSet.add(skill.cardID.toString())
          }

          // ExSkillList에서 카드 ID 찾기
          if (skill && skill.ExSkillList && skill.ExSkillList.length > 0) {
            skill.ExSkillList.forEach((exSkill) => {
              const exSkillData = data.skills[exSkill.ExSkillName.toString()]
              if (exSkillData && exSkillData.cardID) {
                cardSet.add(exSkillData.cardID.toString())
              }
            })
          }
        })
      }
    })

    // Convert to array
    return Array.from(cardSet)
      .map((id) => {
        const card = data.cards[id]
        if (!card) return null
        return { card }
      })
      .filter(Boolean)
  }, [data, selectedCharacters])

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
        if (data.excludedSkillIds && data.excludedSkillIds.includes(skillId)) {
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

        // 스킬 자체에 cardID가 있으면 카드 추가 (이 부분 추가)
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
            if (data.excludedSkillIds && data.excludedSkillIds.includes(exSkillId)) {
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

  // Update cards after character removal
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

  // Add character to a specific slot
  const addCharacter = useCallback(
    (characterId: number, slot: number) => {
      if (slot < 0 || slot >= 5) return

      setSelectedCharacters((prev) => {
        const newSelection = [...prev]
        newSelection[slot] = characterId
        return newSelection
      })

      // 리더 설정 로직 수정:
      // 1. 리더가 없는 경우(-1) 또는
      // 2. 현재 선택된 캐릭터가 리더이고, 다른 캐릭터가 없는 경우
      // 새로 추가된 캐릭터를 리더로 설정
      setSelectedCharacters((prev) => {
        // 리더가 없는 경우
        if (leaderCharacter === -1) {
          setLeaderCharacter(characterId)
        }
        // 현재 리더가 교체되는 경우 (슬롯의 캐릭터가 리더이고, 다른 캐릭터가 없는 경우)
        else if (prev[slot] === leaderCharacter) {
          const otherCharacters = prev.filter((id, i) => id !== -1 && i !== slot)
          if (otherCharacters.length === 0) {
            setLeaderCharacter(characterId)
          }
        }
        // 현재 선택된 캐릭터가 유일한 캐릭터인 경우
        else {
          const selectedCharCount = prev.filter((id) => id !== -1).length
          if (selectedCharCount <= 1) {
            setLeaderCharacter(characterId)
          }
        }
        return prev
      })

      // 캐릭터의 스킬 목록을 기반으로 카드 생성
      generateCardsFromSkills(characterId)
    },
    [leaderCharacter, generateCardsFromSkills, setSelectedCharacters],
  )

  // Remove character from a specific slot
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

      // Clear equipment for this slot and remove related cards
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

      // If removing the leader, set a new leader if possible
      if (characterId === leaderCharacter) {
        const remainingCharacters = selectedCharacters.filter((id, i) => id !== -1 && i !== slot)
        setLeaderCharacter(remainingCharacters.length > 0 ? remainingCharacters[0] : -1)
      }

      // Update cards after character removal
      updateCardsAfterCharacterRemoval(characterId)
    },
    [selectedCharacters, leaderCharacter, equipment, removeCardsFromEquipment, updateCardsAfterCharacterRemoval],
  )

  // Set a character as the leader
  const setLeader = useCallback(
    (characterId: number) => {
      if (selectedCharacters.includes(characterId)) {
        setLeaderCharacter(characterId)
      }
    },
    [selectedCharacters],
  )

  // Remove card from selection
  const removeCard = useCallback(
    (cardId: string) => {
      setSelectedCards((prev) => prev.filter((card) => card.id !== cardId))
    },
    [setSelectedCards],
  )

  // Reorder cards
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

  // Update card settings
  const updateCardSettings = useCallback(
    (cardId: string, useType: number, useParam: number, useParamMap?: Record<string, number>) => {
      setSelectedCards((currentCards) => {
        // 새로운 카드 배열 생성
        const newCards: SelectedCard[] = []

        // 1. 먼저 프리셋의 cardList에 있는 모든 카드를 추가합니다
        // 이렇게 하면 프리셋의 카드 순서가 유지됩니다

        return currentCards.map((card) => (card.id === cardId ? { ...card, useType, useParam, useParamMap } : card))
      })
    },
    [setSelectedCards],
  )

  // Update battle settings
  const updateBattleSettings = useCallback((settings: Partial<typeof battleSettings>) => {
    setBattleSettings((prev) => ({ ...prev, ...settings }))
  }, [])

  // Update equipment for a character
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

  // Clear all settings
  const clearAll = useCallback(() => {
    setSelectedCharacters([-1, -1, -1, -1, -1])
    setLeaderCharacter(-1)
    setSelectedCards([])
    setBattleSettings({
      isLeaderCardOn: true,
      isSpCardOn: true,
      keepCardNum: 0,
      discardType: 0,
      otherCard: 0,
    })
    setEquipment(Array(5).fill({ weapon: null, armor: null, accessory: null }))
  }, [setSelectedCards, setSelectedCharacters])

  // 기존 createPresetObject 함수를 다음으로 교체:
  const createPresetObject = useCallback(
    (includeEquipment = false) => {
      // Transform selected cards to match the required format
      const formattedCardList = selectedCardsRef.current.map((card) => {
        // 기본 카드 객체 생성
        const cardObj: PresetCard = {
          id: card.id,
          ownerId: card.ownerId || -1, // 이미 존재하는 ownerId 사용
          skillId: card.skillId || -1, // 이미 존재하는 skillId 사용
          skillIndex: card.skillIndex || -1, // 이미 존재하는 skillIndex 사용
          targetType: 0, // Always 0 as specified
          useType: card.useType,
          useParam: card.useParam,
          useParamMap: card.useParamMap || {},
          equipIdList: [], // 기본 빈 배열
        }

        // 장비 소스 정보 추가
        if (card.sources) {
          // 장비 소스 처리
          const equipmentSources = card.sources.filter((source) => source.type === "equipment")
          if (equipmentSources.length > 0) {
            cardObj.equipIdList = equipmentSources.map((source) => source.id.toString())
          }
        }

        // skillId가 없는 경우에만 데이터에서 찾아서 설정
        if (cardObj.skillId === -1 && data) {
          const cardData = data.cards[card.id]

          if (cardData) {
            // skillId가 없는 경우에만 찾기
            // Find the corresponding skill
            let foundSkillId = -1
            for (const skillId in data.skills) {
              const skill = data.skills[skillId]
              if (skill.cardID && skill.cardID.toString() === card.id) {
                foundSkillId = Number.parseInt(skillId)
                cardObj.skillId = foundSkillId
                break
              }
            }

            // Check if this is a special skill (in specialSkillIds)
            const isSpecialSkill =
              data.specialSkillIds && foundSkillId > 0 && data.specialSkillIds.includes(foundSkillId)

            if (isSpecialSkill) {
              // For special skills, set ownerId to 10000001
              cardObj.ownerId = 10000001
            }

            // Only set skillIndex if this skill is directly in the character's skillList and it's not already set
            if (cardObj.skillIndex === -1 && cardObj.ownerId > 0 && foundSkillId > 0) {
              const character = data.characters[cardObj.ownerId.toString()]
              if (character && character.skillList) {
                const skillIndex = character.skillList.findIndex((s) => s.skillId === foundSkillId)
                if (skillIndex !== -1) {
                  // skillIndex starts from 1, not 0
                  cardObj.skillIndex = skillIndex + 1
                }
              }
            }
          }
        }

        // Remove skillIndex if it's not found in the character's skillList
        if (cardObj.skillIndex === -1) {
          delete cardObj.skillIndex
        }

        return cardObj
      })

      // Create a CardIdMap object (cardId: 1 format)
      const cardIdMap: Record<string, number> = {}
      selectedCardsRef.current.forEach((card) => {
        cardIdMap[card.id] = 1
      })

      // 기본 프리셋 객체 생성
      const preset = {
        roleList: selectedCharacters,
        header: leaderCharacter,
        cardList: formattedCardList,
        cardIdMap: cardIdMap,
        isLeaderCardOn: battleSettings.isLeaderCardOn,
        isSpCardOn: battleSettings.isSpCardOn,
        keepCardNum: battleSettings.keepCardNum,
        discardType: battleSettings.discardType + 1, // Add +1 to discardType
        otherCard: battleSettings.otherCard,
      }

      // 장비 정보를 포함해야 하는 경우에만 추가
      if (includeEquipment) {
        // 장비 정보 생성
        const equipmentData: Record<number, [string | null, string | null, string | null]> = {}

        // 캐릭터가 있는 슬롯에 대해서만 장비 정보 추가
        selectedCharacters.forEach((charId, index) => {
          if (charId !== -1) {
            const charEquipment = equipment[index]
            // 장비가 하나라도 있는 경우에만 추가
            if (charEquipment.weapon || charEquipment.armor || charEquipment.accessory) {
              equipmentData[index] = [charEquipment.weapon, charEquipment.armor, charEquipment.accessory]
            }
          }
        })

        // 장비 정보가 있는 경우에만 추가
        if (Object.keys(equipmentData).length > 0) {
          return {
            ...preset,
            equipment: equipmentData,
          }
        }
      }

      return preset
    },
    [selectedCharacters, leaderCharacter, battleSettings, data, equipment],
  )

  // exportPreset 함수를 수정하여 장비 정보를 포함하지 않도록 변경
  const exportPreset = useCallback(() => {
    try {
      const preset = createPresetObject(false) // 장비 정보 제외
      const base64String = encodePreset(preset)
      navigator.clipboard.writeText(base64String)
      return { success: true, message: "export_success" }
    } catch (error) {
      return { success: false, message: "export_failed" }
    }
  }, [createPresetObject])

  // exportPresetToString 함수를 수정하여 장비 정보를 포함하지 않도록 변경
  const exportPresetToString = useCallback(() => {
    try {
      const preset = createPresetObject(false) // 장비 정보 제외
      return encodePreset(preset)
    } catch (error) {
      return ""
    }
  }, [createPresetObject])

  // 프리셋 객체를 직접 가져와서 적용
  const importPresetObject = useCallback(
    (preset: any) => {
      try {
        // Validate preset structure
        if (!preset.roleList || !Array.isArray(preset.roleList) || preset.roleList.length !== 5) {
          throw new Error("Invalid roleList")
        }

        if (!preset.cardList || !Array.isArray(preset.cardList)) {
          throw new Error("Invalid cardList")
        }

        // 먼저 모든 상태 초기화
        clearAll()

        // 로컬 변수로 업데이트된 상태 추적
        const updatedCharacters = [-1, -1, -1, -1, -1]
        const updatedEquipment = Array(5).fill({ weapon: null, armor: null, accessory: null })

        // 캐릭터 설정 - 이 과정에서 캐릭터 스킬 카드가 자동으로 추가됨
        preset.roleList.forEach((charId: number, index: number) => {
          if (charId !== -1) {
            addCharacter(charId, index)
            updatedCharacters[index] = charId
          }
        })

        // 리더 설정
        if (preset.header !== -1) {
          setLeader(preset.header)
        }

        // 장비 설정 - 이 과정에서 장비 스킬 카드가 자동으로 추가됨
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

        // 카드 설정 업데이트 (useType, useParam 등)
        // 이 부분을 완전히 새로운 접근 방식으로 변경합니다
        setSelectedCards((currentCards) => {
          // 새로운 카드 배열 생성
          const newCards: SelectedCard[] = []

          // 1. 먼저 프리셋의 cardList에 있는 모든 카드를 추가합니다
          // 이렇게 하면 프리셋의 카드 순서가 유지됩니다
          preset.cardList.forEach((presetCard: any) => {
            // 현재 카드 목록에서 해당 ID를 가진 카드 찾기
            const existingCard = currentCards.find((card) => card.id === presetCard.id)

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
              // 이 경우는 프리셋에는 있지만 현재 선택된 캐릭터/장비에서는 생성되지 않은 카드
              // 소스 정보는 비어있게 설정하고, 나중에 필요하면 업데이트할 수 있습니다
              newCards.push({
                id: presetCard.id,
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
          // 이는 주로 장비로부터 파생된 카드들입니다
          const presetCardIds = new Set(preset.cardList.map((card: any) => card.id))

          currentCards.forEach((card) => {
            // 이미 추가되지 않은 카드만 추가
            if (!presetCardIds.has(card.id)) {
              newCards.push(card)
            }
          })

          return newCards
        })

        // 전투 설정 업데이트
        setBattleSettings({
          isLeaderCardOn: preset.isLeaderCardOn !== undefined ? preset.isLeaderCardOn : true,
          isSpCardOn: preset.isSpCardOn !== undefined ? preset.isSpCardOn : true,
          keepCardNum: preset.keepCardNum !== undefined ? preset.keepCardNum : 0,
          discardType: preset.discardType !== undefined ? preset.discardType - 1 : 0, // Subtract 1 from discardType
          otherCard: preset.otherCard !== undefined ? preset.otherCard : 0,
        })

        return { success: true, message: "import_success" }
      } catch (error) {
        return { success: false, message: "import_failed" }
      }
    },
    [addCharacter, setLeader, updateEquipment, clearAll, setSelectedCards, data, getSkill],
  )

  // Import preset from clipboard
  const importPreset = useCallback(async () => {
    try {
      const base64Text = await navigator.clipboard.readText()

      // Use the new decodePreset function
      const preset = decodePreset(base64Text)

      if (!preset) {
        throw new Error("invalid_preset_format")
      }

      // Validate preset structure
      if (!preset.roleList || !Array.isArray(preset.roleList) || preset.roleList.length !== 5) {
        throw new Error("invalid_rolelist")
      }

      if (!preset.cardList || !Array.isArray(preset.cardList)) {
        throw new Error("invalid_cardlist")
      }

      // 기존 코드 대신 importPresetObject 함수 호출
      return importPresetObject(preset)
    } catch (error) {
      return { success: false, message: "import_failed" }
    }
  }, [importPresetObject])

  // getEquipment 함수 추가
  const getEquipment = useCallback(
    (equipId: string) => {
      if (!data || !data.equipments) return null
      return data.equipments[equipId] || null
    },
    [data],
  )

  // Add this to the return object of useDeckBuilder
  const allEquipments = useMemo(() => {
    if (!data || !data.equipments) return []
    return Object.values(data.equipments)
  }, [data])

  // 프리셋 문자열을 디코딩하는 함수
  const decodePresetString = useCallback((base64Text: string) => {
    try {
      // Use the decodePreset function
      const preset = decodePreset(base64Text)

      if (!preset) {
        return null
      }

      // Validate preset structure
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

  // createShareableUrl 함수를 수정하여 장비 정보를 포함하도록 변경
  const createShareableUrl = useCallback(() => {
    try {
      const preset = createPresetObject(true) // 장비 정보 포함
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

  // createRootShareableUrl 함수를 수정하여 장비 정보를 포함하도록 변경
  const createRootShareableUrl = useCallback(() => {
    try {
      const preset = createPresetObject(true) // 장비 정보 포함
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

  // 반환 객체에 getEquipment 추가
  return {
    selectedCharacters,
    leaderCharacter,
    selectedCards: selectedCardsRef.current,
    battleSettings,
    equipment,
    isDarkMode,
    availableCards,
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

