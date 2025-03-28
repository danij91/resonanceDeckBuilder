"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Database, Preset } from "../types"
import { encodePreset, decodePreset } from "../utils/presetCodec"

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
  const [language, setLanguage] = useState<string>("en")

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

  // Get card extra info by ID
  const getCardExtraInfo = useCallback(
    (id: string) => {
      if (!data) return null
      return data.cardExtraInfo[id]
    },
    [data],
  )

  // Get equipment by ID
  const getEquipment = useCallback(
    (id: string) => {
      if (!data) return null
      return data.equipment[id]
    },
    [data],
  )

  // Get card info by ID
  const getCardInfo = useCallback(
    (cardId: string) => {
      if (!data) return null
      const card = data.cards[cardId]
      const extraInfo = data.cardExtraInfo[cardId]
      if (!card || !extraInfo) return null
      return { card, extraInfo }
    },
    [data],
  )

  // Get all available cards for selected characters
  const availableCards = useMemo(() => {
    if (!data) return []

    const cardSet = new Set<string>()
    const validCharacters = selectedCharacters.filter((id) => id !== -1)

    // Add cards owned by selected characters
    Object.values(data.cards).forEach((card) => {
      if (validCharacters.includes(card.ownerId)) {
        cardSet.add(card.id)
      }
    })

    // Add produceSkills from selected characters
    validCharacters.forEach((charId) => {
      const character = data.characters[charId.toString()]
      if (character && character.produceSkills) {
        character.produceSkills.forEach((cardId) => {
          cardSet.add(cardId)
        })
      }
    })

    // Convert to array and filter out cards without extra info
    return Array.from(cardSet)
      .map((id) => {
        const card = data.cards[id]
        const extraInfo = data.cardExtraInfo[id]
        if (!extraInfo) return null
        return { card, extraInfo }
      })
      .filter(Boolean)
  }, [data, selectedCharacters])

  // Add character to a specific slot
  const addCharacter = useCallback(
    (characterId: number, slot: number) => {
      if (slot < 0 || slot >= 5) return

      setSelectedCharacters((prev) => {
        const newSelection = [...prev]
        newSelection[slot] = characterId
        return newSelection
      })

      // If this is the first character, set as leader
      if (leaderCharacter === -1) {
        setLeaderCharacter(characterId)
      }

      // Add produceSkills to selected cards
      if (data) {
        const character = data.characters[characterId.toString()]
        if (character && character.produceSkills) {
          setSelectedCards((prev) => {
            const newCards = [...prev]

            // Add each produceSkill if it's not already in the list
            character.produceSkills.forEach((cardId) => {
              if (!newCards.some((card) => card.id === cardId)) {
                newCards.push({
                  id: cardId,
                  useType: 1,
                  useParam: -1,
                  useParamMap: {},
                })
              }
            })

            return newCards
          })
        }
      }
    },
    [leaderCharacter, data],
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

      // Get all produceSkills from remaining characters
      const remainingProduceSkills = new Set<string>()
      remainingCharacters.forEach((charId) => {
        const character = data.characters[charId.toString()]
        if (character && character.produceSkills) {
          character.produceSkills.forEach((cardId) => {
            remainingProduceSkills.add(cardId)
          })
        }
      })

      // Get produceSkills of the removed character
      const removedCharacter = data.characters[removedCharacterId.toString()]
      const removedProduceSkills = removedCharacter?.produceSkills || []

      // Filter out cards that are no longer valid
      setSelectedCards((prev) => {
        return prev.filter((selectedCard) => {
          const card = data.cards[selectedCard.id]

          // Keep if card is owned by a remaining character
          if (card && remainingCharacters.includes(card.ownerId)) {
            return true
          }

          // If this is a produceSkill of the removed character
          if (removedProduceSkills.includes(selectedCard.id)) {
            // Keep if it's also a produceSkill of a remaining character
            return remainingProduceSkills.has(selectedCard.id)
          }

          // Keep all other cards
          return true
        })
      })
    },
    [data, selectedCharacters],
  )

  // Add card to selection
  const addCard = useCallback((cardId: string) => {
    setSelectedCards((prev) => {
      // Check if card is already selected
      if (prev.some((card) => card.id === cardId)) {
        return prev
      }

      // Add card with default settings
      return [...prev, { id: cardId, useType: 1, useParam: -1, useParamMap: {} }]
    })
  }, [])

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

  // Export preset to clipboard
  const exportPreset = useCallback(() => {
    // Create equipment array for export
    const equipmentExport = equipment.flatMap((equip, index) => {
      const charId = selectedCharacters[index]
      if (charId === -1) return []

      const items = []
      if (equip.weapon) items.push({ id: equip.weapon, charId })
      if (equip.armor) items.push({ id: equip.armor, charId })
      if (equip.accessory) items.push({ id: equip.accessory, charId })

      return items
    })

    // Create cardIdMap with all selected card IDs set to 1
    const cardIdMap: Record<string, number> = {}
    selectedCards.forEach((card) => {
      cardIdMap[card.id] = 1
    })

    // 카드 정보에 필요한 필드 추가
    const enhancedCardList = selectedCards.map((card) => {
      if (!data || !data.cards[card.id]) {
        return card
      }

      const originalCard = data.cards[card.id]

      return {
        ...card,
        ownerId: originalCard.ownerId,
        skillId: originalCard.skillId,
        skillIndex: originalCard.skillIndex,
        targetType: originalCard.targetType,
        equipIdList: originalCard.equipIdList,
      }
    })

    const preset: Preset = {
      roleList: selectedCharacters,
      header: leaderCharacter,
      cardList: enhancedCardList,
      isLeaderCardOn: battleSettings.isLeaderCardOn,
      isSpCardOn: battleSettings.isSpCardOn,
      keepCardNum: battleSettings.keepCardNum,
      discardType: battleSettings.discardType + 1, // Add +1 to discardType
      otherCard: battleSettings.otherCard,
      equipment: equipmentExport.length > 0 ? equipmentExport : undefined,
      cardIdMap: cardIdMap, // Add the cardIdMap to the preset
    }

    try {
      // Use the new encodePreset function
      const base64String = encodePreset(preset)
      navigator.clipboard.writeText(base64String)
      return { success: true, message: getTranslatedString("export_success") || "Export successful!" }
    } catch (error) {
      console.error("Export failed:", error)
      return { success: false, message: getTranslatedString("export_failed") || "Export failed!" }
    }
  }, [selectedCharacters, leaderCharacter, selectedCards, battleSettings, equipment, getTranslatedString, data])

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
      setSelectedCards(preset.cardList)
      setBattleSettings({
        isLeaderCardOn: preset.isLeaderCardOn,
        isSpCardOn: preset.isSpCardOn,
        keepCardNum: preset.keepCardNum,
        discardType: preset.discardType - 1, // Subtract 1 from discardType
        otherCard: preset.otherCard,
      })

      // Reset equipment
      const newEquipment = Array(5).fill({ weapon: null, armor: null, accessory: null })

      // Apply equipment if present
      if (preset.equipment && Array.isArray(preset.equipment)) {
        preset.equipment.forEach((item) => {
          const slotIndex = preset.roleList.findIndex((id) => id === item.charId)
          if (slotIndex !== -1) {
            const equip = data?.equipment[item.id]
            if (equip) {
              if (equip.type === "weapon") {
                newEquipment[slotIndex].weapon = item.id
              } else if (equip.type === "acc") {
                newEquipment[slotIndex].accessory = item.id
              } else {
                newEquipment[slotIndex].armor = item.id
              }
            }
          }
        })
      }

      setEquipment(newEquipment)

      return { success: true, message: getTranslatedString("import_success") || "Import successful!" }
    } catch (error) {
      console.error("Import failed:", error)
      return { success: false, message: getTranslatedString("import_failed") || "Import failed!" }
    }
  }, [data, getTranslatedString])

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
    getCardExtraInfo,
    getEquipment,
    getCardInfo,
    addCharacter,
    removeCharacter,
    setLeader,
    addCard,
    removeCard,
    reorderCards,
    updateCardSettings,
    updateBattleSettings,
    updateEquipment,
    setLanguage,
    toggleDarkMode,
    clearAll,
    exportPreset,
    importPreset,
  }
}

