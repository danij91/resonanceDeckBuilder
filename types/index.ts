// Character Types
export interface Character {
  id: number
  name: string
  rarity: string
  desc: string
  img_card?: string
  skills?: Record<string, string>
  produceSkills?: string[] // Added produceSkills array
  awakening: Awakening[]
  resonance: Resonance[]
}

export interface Awakening {
  name: string
  desc: string
}

export interface Resonance {
  name: string
  desc: string
}

// Card Types
export interface Card {
  id: string
  ownerId: number
  skillId: string | number
  skillIndex?: number
  targetType: number
  useParam: number
  useParamMap: Record<string, number>
  useType: number
  equipIdList: string[]
}

// Card Extra Info Types
export interface CardExtraInfo {
  id: number
  amount: string
  cost: string
  desc: string
  name: string
  img_url: string
  specialCtrl?: string[]
}

// Equipment Types
export interface Equipment {
  id: string
  name: string
  url: string
  rarity: string
  desc: string
  type: string
}

// Special Control Types
export interface SpecialControl {
  text: string
  icon?: string
  minimum?: string
  maximum?: string
}

// Extra Info Types
export interface ExtraInfo {
  specialCtrlIcon: Record<string, SpecialControl>
}

// Language Types
export interface LanguageStrings {
  [key: string]: string
}

export interface Languages {
  [langCode: string]: LanguageStrings
}

// Preset Types
export interface Preset {
  roleList: number[]
  header: number
  cardList: PresetCard[]
  isLeaderCardOn: boolean
  isSpCardOn: boolean
  keepCardNum: number
  discardType: number
  otherCard: number
  equipment?: PresetEquipment[]
  cardIdMap?: Record<string, number> // Add cardIdMap field
}

export interface PresetCard {
  id: string
  useType: number
  useParam: number
}

export interface PresetEquipment {
  id: string
  charId: number
}

// Database Types
export interface Database {
  characters: Record<string, Character>
  cards: Record<string, Card>
  cardExtraInfo: Record<string, CardExtraInfo>
  equipment: Record<string, Equipment>
  extraInfo: ExtraInfo
  languages: Languages
}

