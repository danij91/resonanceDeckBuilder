import type { Character, SkillCard, BattleSettings } from "@/contexts/deck-context"

// Define types for the imported data
export interface ImportedData {
  keepCardNum: number
  roleList: number[]
  otherCard: number
  cardList: ImportedCard[]
  header: number
  discardType: number
  cardIdMap: Record<string, number>
  isSpCardOn: boolean
  isLeaderCardOn: boolean
}

export interface ImportedCard {
  targetType: number
  id: string
  useParam: number
  useType: number
  skillId: number | string
  ownerId: number
  skillIndex?: number
  equipIdList?: any[]
  useParamMap?: Record<string, number>
}

// Card and character database interfaces
export interface CardDB {
  [key: string]: {
    ownerId: string
    skillId: string
    cost: number
    count: number
    img_url: string
  }
}

export interface CardTexts {
  [key: string]: {
    name: string
    description: string
  }
}

export interface CharacterDB {
  [key: string]: {
    rarity: string
    skills: {
      skill1: string
      skill2: string
      ultimate: string
    }
    img_card: string
  }
}

export interface CharacterTexts {
  [key: string]: {
    name: string
    resonance: Record<string, { name: string; description: string }>
    awakening: Record<string, { name: string; description: string }>
  }
}

// Parse imported data to our app format
export function parseImportedData(
  importedData: ImportedData,
  cardDB: CardDB,
  cardTexts: CardTexts,
  characterDB: CharacterDB,
  characterTexts: CharacterTexts,
): {
  characters: (Character | null)[]
  leaderId: number | null
  skillCards: SkillCard[]
  battleSettings: BattleSettings
} {
  // Parse characters
  const characters: (Character | null)[] = Array(5).fill(null)

  importedData.roleList.forEach((characterId, index) => {
    const charIdStr = characterId.toString()
    if (characterDB[charIdStr] && characterTexts[charIdStr]) {
      characters[index] = {
        id: characterId,
        name: characterTexts[charIdStr].name || `Character ${characterId}`,
        rank: characterDB[charIdStr].rarity || "R",
        image: characterDB[charIdStr].img_card || "/placeholder.svg?height=180&width=120",
        resonance: Object.entries(characterTexts[charIdStr].resonance || {}).map(([level, data]) => ({
          level: Number.parseInt(level),
          name: data.name,
          description: data.description,
        })),
        awakening: Object.entries(characterTexts[charIdStr].awakening || {}).map(([level, data]) => ({
          level: Number.parseInt(level),
          name: data.name,
          description: data.description,
        })),
      }
    }
  })

  // Set leader
  const leaderId = importedData.header || null

  // Parse skill cards
  const skillCards: SkillCard[] = importedData.cardList.map((card, index) => {
    const cardData = cardDB[card.id] || {}
    const cardText = cardTexts[card.id] || {}

    return {
      id: Number.parseInt(card.id),
      name: cardText.name || `Card ${card.id}`,
      priority: index + 1,
      cost: cardData.cost || 0,
      characterImage: characterDB[card.ownerId.toString()]?.img_card || "/placeholder.svg?height=200&width=100",
      skillImage: cardData.img_url || "/placeholder.svg?height=50&width=50",
      description: cardText.description || "",
      ownerId: card.ownerId,
      skillId: card.skillId,
      quantity: cardData.count || 1,
      useType: card.useType,
      useParam: card.useParam,
      targetType: card.targetType,
      skillIndex: card.skillIndex,
      useParamMap: card.useParamMap || {},
      equipIdList: card.equipIdList || [],
    }
  })

  // Create battle settings
  const battleSettings: BattleSettings = {
    leaderSkillActive: importedData.isLeaderCardOn,
    ultimateSkillActive: importedData.isSpCardOn,
    discardCondition:
      importedData.discardType === 0 ? "auto" : importedData.discardType === 1 ? "manual" : "conditional",
    handRetention: importedData.keepCardNum,
    enemyCardPriority: "highest-attack",
  }

  return {
    characters,
    leaderId,
    skillCards,
    battleSettings,
  }
}

// Format our app data to the export format
export function formatExportData(
  characters: (Character | null)[],
  leaderId: number | null,
  skillCards: SkillCard[],
  battleSettings: BattleSettings,
): ImportedData {
  // Create role list from characters
  const roleList = characters.filter((char): char is Character => char !== null).map((char) => char.id)

  // Create card list from skill cards
  const cardList = skillCards.map((card) => {
    const exportCard: ImportedCard = {
      targetType: card.targetType || 0,
      id: card.id.toString(),
      useParam: card.useParam || -1,
      useType: card.useType || 1,
      skillId: card.skillId || 0,
      ownerId: card.ownerId || 0,
    }

    if (card.skillIndex !== undefined) {
      exportCard.skillIndex = card.skillIndex
    }

    if (card.equipIdList && card.equipIdList.length > 0) {
      exportCard.equipIdList = card.equipIdList
    }

    if (card.useParamMap && Object.keys(card.useParamMap).length > 0) {
      exportCard.useParamMap = card.useParamMap
    }

    return exportCard
  })

  // Create card ID map
  const cardIdMap: Record<string, number> = {}
  skillCards.forEach((card) => {
    cardIdMap[card.id.toString()] = 1
  })

  return {
    keepCardNum: battleSettings.handRetention,
    roleList,
    otherCard: 0,
    cardList,
    header: leaderId || 0,
    discardType: battleSettings.discardCondition === "auto" ? 0 : battleSettings.discardCondition === "manual" ? 1 : 2,
    cardIdMap,
    isSpCardOn: battleSettings.ultimateSkillActive,
    isLeaderCardOn: battleSettings.leaderSkillActive,
  }
}

