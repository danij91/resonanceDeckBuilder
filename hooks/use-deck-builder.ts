"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Database, Skill } from "../types"
import { encodePreset, decodePreset } from "../utils/presetCodec"

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

export function useDeckBuilder(data: Database | null) {
  // Character selection (5 slots, -1 means empty)
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([-1, -1, -1, -1, -1])

  // Leader character
  const [leaderCharacter, setLeaderCharacter] = useState<number>(-1)

  // Selected cards in priority order
  const [selectedCards, setSelectedCards] = useState<
    {
      id: string
      useType: number
      useParam: number
      useParamMap?: Record<string, number>
    }[]
  >([])

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

  // Language selection
  const [language, setLanguageState] = useState<string>("en")

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

  // Get translated string
  const getTranslatedString = useCallback(
    (key: string) => {
      if (!data || !data.languages[language]) return key
      return data.languages[language][key] || key
    },
    [data, language],
  )

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

  // Add card to selection - MOVED UP to fix circular dependency
  const addCard = useCallback((cardId: string) => {
    console.log(`Attempting to add card ${cardId} to selectedCards`)

    setSelectedCards((prev) => {
      // Check if card is already selected
      if (prev.some((card) => card.id === cardId)) {
        console.log(`Card ${cardId} already in selectedCards, not adding`)
        return prev
      }

      // Add card with default settings
      console.log(`Adding card ${cardId} to selectedCards`)
      return [...prev, { id: cardId, useType: 1, useParam: -1 }]
    })
  }, [])

  // Get all available cards for selected characters
  const availableCards = useMemo(() => {
    if (!data) return []

    const cardSet = new Set<string>()
    const validCharacters = selectedCharacters.filter((id) => id !== -1)

    // 디버깅 로그 추가
    console.log("Valid characters:", validCharacters)

    // 모든 카드 순회
    Object.values(data.cards).forEach((card) => {
      // 카드 소유자 확인
      if (card.ownerId && validCharacters.includes(card.ownerId)) {
        cardSet.add(card.id.toString())
        console.log(`Added card ${card.id} from owner ${card.ownerId}`)
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
            console.log(`Added card ${skill.cardID} from skill ${skillItem.skillId} of character ${charId}`)
          }

          // ExSkillList에서 카드 ID 찾기
          if (skill && skill.ExSkillList && skill.ExSkillList.length > 0) {
            skill.ExSkillList.forEach((exSkill) => {
              const exSkillData = data.skills[exSkill.ExSkillName.toString()]
              if (exSkillData && exSkillData.cardID) {
                cardSet.add(exSkillData.cardID.toString())
                console.log(
                  `Added card ${exSkillData.cardID} from ExSkill ${exSkill.ExSkillName} of skill ${skillItem.skillId}`,
                )
              }
            })
          }
        })
      }
    })

    // 디버깅 로그 추가
    console.log("Available cards:", Array.from(cardSet))

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
        console.log("No data available, cannot generate cards")
        return
      }

      console.log(`Generating cards for character ${characterId}`)

      const character = data.characters[characterId.toString()]
      if (!character || !character.skillList) {
        console.log(`Character ${characterId} not found or has no skills`)
        return
      }

      console.log(`Character ${characterId} skills:`, character.skillList)

      // 처리된 스킬 ID를 추적하기 위한 Set
      const processedSkills = new Set<number>()

      // 스킬 처리 함수
      const processSkill = (skillId: number) => {
        // 이미 처리한 스킬은 건너뛰기
        if (processedSkills.has(skillId)) return
        processedSkills.add(skillId)

        // 제외된 스킬 ID 목록에 있는지 확인
        if (data.excludedSkillIds && data.excludedSkillIds.includes(skillId)) {
          console.log(`Skill ${skillId} is in the excluded list, skipping`)
          return
        }

        const skill = getSkill(skillId)
        if (!skill) return

        // 스킬에 cardID가 있으면 카드 추가
        if (skill.cardID) {
          const cardId = skill.cardID.toString()

          // Check if this is a special skill
          const isSpecialSkill = data.specialSkillIds && data.specialSkillIds.includes(skillId)

          // For non-special skills, ensure the ownerId is set correctly
          if (!isSpecialSkill) {
            const cardData = data.cards[cardId]
            if (cardData && cardData.ownerId === undefined) {
              // This card originated from this character's skill, so set the ownerId
              cardData.ownerId = characterId
            }
          }

          addCard(cardId)
        }

        // ExSkillList 처리
        if (skill.ExSkillList && skill.ExSkillList.length > 0) {
          skill.ExSkillList.forEach((exSkill) => {
            const exSkillId = exSkill.ExSkillName
            processSkill(exSkillId)
          })
        }
      }

      // 캐릭터의 모든 스킬 처리
      character.skillList.forEach((skillItem) => {
        processSkill(skillItem.skillId)
      })

      console.log(`Finished generating cards for character ${characterId}`)
    },
    [data, getSkill, addCard],
  )

  // Add character to a specific slot
  const addCharacter = useCallback(
    (characterId: number, slot: number) => {
      if (slot < 0 || slot >= 5) return

      console.log(`Adding character ${characterId} to slot ${slot}`)

      setSelectedCharacters((prev) => {
        const newSelection = [...prev]
        newSelection[slot] = characterId
        return newSelection
      })

      // If this is the first character, set as leader
      if (leaderCharacter === -1) {
        setLeaderCharacter(characterId)
      }

      // 캐릭터의 스킬 목록을 기반으로 카드 생성
      generateCardsFromSkills(characterId)
    },
    [leaderCharacter, generateCardsFromSkills],
  )

  // Remove character from a specific slot
  const removeCharacter = useCallback(
    (slot: number) => {
      if (slot < 0 || slot >= 5) return

      const characterId = selectedCharacters[slot]

      setSelectedCharacters((prev) => {
        const newSelection = [...prev]
        newSelection[slot] = -1
        return newSelection
      })

      // Clear equipment for this slot
      setEquipment((prev) => {
        const newEquipment = [...prev]
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
    [selectedCharacters, leaderCharacter],
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

  // Update cards after character removal
  const updateCardsAfterCharacterRemoval = useCallback(
    (removedCharacterId: number) => {
      if (!data) return

      // Get remaining characters
      const remainingCharacters = selectedCharacters.filter((id) => id !== -1 && id !== removedCharacterId)

      // 제거된 캐릭터의 스킬 목록 가져오기
      const removedCharacter = data.characters[removedCharacterId.toString()]
      if (!removedCharacter || !removedCharacter.skillList) return

      // 제거된 캐릭터의 스킬 ID 목록
      const removedSkillIds = new Set<number>()
      removedCharacter.skillList.forEach((skillItem) => {
        removedSkillIds.add(skillItem.skillId)
      })

      // ExSkillList 처리
      removedSkillIds.forEach((skillId) => {
        const skill = getSkill(skillId)
        if (skill && skill.ExSkillList) {
          skill.ExSkillList.forEach((exSkill) => {
            removedSkillIds.add(exSkill.ExSkillName)
          })
        }
      })

      // 제거된 캐릭터의 카드 ID 목록
      const removedCardIds = new Set<string>()
      removedSkillIds.forEach((skillId) => {
        const skill = getSkill(skillId)
        if (skill && skill.cardID) {
          removedCardIds.add(skill.cardID.toString())
        }
      })

      // 남아있는 캐릭터들의 스킬 ID 목록
      const remainingSkillIds = new Set<number>()
      remainingCharacters.forEach((charId) => {
        const character = data.characters[charId.toString()]
        if (character && character.skillList) {
          character.skillList.forEach((skillItem) => {
            remainingSkillIds.add(skillItem.skillId)
          })
        }
      })

      // ExSkillList 처리
      remainingSkillIds.forEach((skillId) => {
        const skill = getSkill(skillId)
        if (skill && skill.ExSkillList) {
          skill.ExSkillList.forEach((exSkill) => {
            remainingSkillIds.add(exSkill.ExSkillName)
          })
        }
      })

      // 남아있는 캐릭터들의 카드 ID 목록
      const remainingCardIds = new Set<string>()
      remainingSkillIds.forEach((skillId) => {
        const skill = getSkill(skillId)
        if (skill && skill.cardID) {
          remainingCardIds.add(skill.cardID.toString())
        }
      })

      // 제거된 카드 중 남아있는 캐릭터들이 가지고 있지 않은 카드만 제거
      setSelectedCards((prev) => {
        return prev.filter((card) => {
          // 제거된 캐릭터의 카드가 아니거나, 남아있는 캐릭터들이 가지고 있는 카드는 유지
          return !removedCardIds.has(card.id) || remainingCardIds.has(card.id)
        })
      })
    },
    [data, selectedCharacters, getSkill],
  )

  // Remove card from selection
  const removeCard = useCallback((cardId: string) => {
    setSelectedCards((prev) => prev.filter((card) => card.id !== cardId))
  }, [])

  // Reorder cards
  const reorderCards = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedCards((prev) => {
      const result = [...prev]
      const [removed] = result.splice(fromIndex, 1)
      result.splice(toIndex, 0, removed)
      return result
    })
  }, [])

  // Update card settings
  const updateCardSettings = useCallback(
    (cardId: string, useType: number, useParam: number, useParamMap?: Record<string, number>) => {
      setSelectedCards((prev) =>
        prev.map((card) => (card.id === cardId ? { ...card, useType, useParam, useParamMap } : card)),
      )
    },
    [],
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
        newEquipment[slotIndex] = {
          ...newEquipment[slotIndex],
          [equipType]: equipId,
        }
        return newEquipment
      })
    },
    [],
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
  }, [])

  // Create preset object for export
  const createPresetObject = useCallback(() => {
    // Transform selected cards to match the required format
    const formattedCardList = selectedCards.map((card) => {
      const cardObj: PresetCard = {
        id: card.id,
        ownerId: -1, // Will be updated below
        skillId: -1, // Will be updated below
        skillIndex: -1, // Will be updated below
        targetType: 0, // Always 0 as specified
        useType: card.useType,
        useParam: card.useParam,
        useParamMap: card.useParamMap || {},
        equipIdList: [],
      }

      if (data) {
        const cardData = data.cards[card.id]

        if (cardData) {
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
          const isSpecialSkill = data.specialSkillIds && foundSkillId > 0 && data.specialSkillIds.includes(foundSkillId)

          if (isSpecialSkill) {
            // For special skills, set ownerId to 10000001
            cardObj.ownerId = 10000001
          } else {
            // For regular cards, set ownerId to the character that owns this card
            cardObj.ownerId = cardData.ownerId || -1
          }

          // Only set skillIndex if this skill is directly in the character's skillList
          if (cardObj.ownerId > 0 && foundSkillId > 0) {
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
    selectedCards.forEach((card) => {
      cardIdMap[card.id] = 1
    })

    return {
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
  }, [selectedCharacters, leaderCharacter, selectedCards, battleSettings, data])

  // Export preset to string without clipboard
  const exportPresetToString = useCallback(() => {
    try {
      const preset = createPresetObject()
      const base64String = encodePreset(preset)
      return base64String
    } catch (error) {
      console.error("Export to string failed:", error)
      return ""
    }
  }, [createPresetObject])

  // Export preset to clipboard
  const exportPreset = useCallback(() => {
    try {
      const preset = createPresetObject()
      const base64String = encodePreset(preset)
      navigator.clipboard.writeText(base64String)
      return { success: true, message: getTranslatedString("export_success") || "Export successful!" }
    } catch (error) {
      console.error("Export failed:", error)
      return { success: false, message: getTranslatedString("export_failed") || "Export failed!" }
    }
  }, [createPresetObject, getTranslatedString])

  // Import preset from clipboard
  const importPreset = useCallback(async () => {
    try {
      const base64Text = await navigator.clipboard.readText()

      // Use the new decodePreset function
      const preset = decodePreset(base64Text)

      if (!preset) {
        throw new Error("Invalid preset format")
      }

      // Validate preset structure
      if (!preset.roleList || !Array.isArray(preset.roleList) || preset.roleList.length !== 5) {
        throw new Error("Invalid roleList")
      }

      if (!preset.cardList || !Array.isArray(preset.cardList)) {
        throw new Error("Invalid cardList")
      }

      // Update state with imported preset
      setSelectedCharacters(preset.roleList)
      setLeaderCharacter(preset.header)

      // Transform the cardList to our internal format
      const simplifiedCardList = preset.cardList.map((card) => ({
        id: card.id,
        useType: card.useType,
        useParam: card.useParam,
        useParamMap: card.useParamMap || {},
        ownerId: card.ownerId, // ownerId 추가
        skillId: card.skillId, // skillId 추가
        skillIndex: card.skillIndex, // skillIndex 추가
      }))

      setSelectedCards(simplifiedCardList)

      // 기본값 설정
      setBattleSettings({
        isLeaderCardOn: preset.isLeaderCardOn !== undefined ? preset.isLeaderCardOn : true,
        isSpCardOn: preset.isSpCardOn !== undefined ? preset.isSpCardOn : true,
        keepCardNum: preset.keepCardNum !== undefined ? preset.keepCardNum : 0,
        discardType: preset.discardType !== undefined ? preset.discardType - 1 : 0, // Subtract 1 from discardType
        otherCard: preset.otherCard !== undefined ? preset.otherCard : 0,
      })

      // Reset equipment
      setEquipment(Array(5).fill({ weapon: null, armor: null, accessory: null }))

      return { success: true, message: getTranslatedString("import_success") || "Import successful!" }
    } catch (error) {
      console.error("Import failed:", error)
      return { success: false, message: getTranslatedString("import_failed") || "Import failed!" }
    }
  }, [getTranslatedString])

  // 언어 변경 함수 - 동적 로딩 추가
  const changeLanguage = useCallback(
    async (newLanguage: string) => {
      // 이미 로드된 언어인지 확인
      if (data && !data.languages[newLanguage]) {
        try {
          // 새 언어 파일 동적 로드 (절대 경로 사용)
          const langResponse = await fetch(`/api/db/lang/${newLanguage}.json`)
          const langData = await langResponse.json()

          // 데이터 업데이트
          if (data && data.languages) {
            data.languages[newLanguage] = langData
          }
        } catch (error) {
          console.error(`Failed to load language: ${newLanguage}`, error)
        }
      }

      // 언어 상태 업데이트
      setLanguageState(newLanguage)
    },
    [data],
  )

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

  // 반환 객체에 getEquipment 추가
  return {
    selectedCharacters,
    leaderCharacter,
    selectedCards,
    battleSettings,
    equipment,
    language,
    isDarkMode,
    availableCards,
    getTranslatedString,
    getCharacter,
    getCard,
    getCardInfo,
    getEquipment,
    getSkill, // 추가: 스킬 정보를 가져오는 함수
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
    setLanguage: changeLanguage,
    toggleDarkMode,
    clearAll,
    exportPreset,
    exportPresetToString,
    importPreset,
  }
}

