import type { Database } from "../../types"

// 카드 소스 타입 - 카드가 어디서 왔는지 추적
export type CardSource =
  | { type: "character"; id: number; skillId?: number; slotIndex?: number }
  | { type: "equipment"; id: string; skillId?: number; slotIndex?: number; equipType: "weapon" | "armor" | "accessory" }
  | { type: "passive"; id: number; skillId?: number; slotIndex?: number }

// 선택된 카드 타입
export type SelectedCard = {
  id: string
  useType: number
  useParam: number
  useParamMap?: Record<string, number>
  ownerId?: number
  skillId?: number
  skillIndex?: number
  sources: CardSource[]
}

// 프리셋 카드 타입
export type PresetCard = {
  id: string
  ownerId: number
  skillId: number
  skillIndex?: number
  targetType: number
  useType: number
  useParam: number
  useParamMap: Record<string, number>
  equipIdList: string[]
}

// 장비 슬롯 타입
export type EquipmentSlot = {
  weapon: string | null
  armor: string | null
  accessory: string | null
}

// 전투 설정 타입
export type BattleSettings = {
  isLeaderCardOn: boolean
  isSpCardOn: boolean
  keepCardNum: number
  discardType: number
  otherCard: number
}

// 프리셋 타입
export type Preset = {
  roleList: number[]
  header: number
  cardList: PresetCard[]
  cardIdMap?: Record<string, number>
  isLeaderCardOn: boolean
  isSpCardOn: boolean
  keepCardNum: number
  discardType: number
  otherCard: number
  equipment?: Record<number, [string | null, string | null, string | null]>
}

// 덱 빌더 상태 타입
export interface DeckBuilderState {
  selectedCharacters: number[]
  leaderCharacter: number
  selectedCards: SelectedCard[]
  battleSettings: BattleSettings
  equipment: EquipmentSlot[]
  isDarkMode: boolean
}

// 덱 빌더 액션 타입
export interface DeckBuilderActions {
  setSelectedCharacters: (characters: number[] | ((prev: number[]) => number[])) => void
  setLeaderCharacter: (leader: number) => void
  setSelectedCards: (cards: SelectedCard[] | ((prev: SelectedCard[]) => SelectedCard[])) => void
  setBattleSettings: (settings: Partial<BattleSettings>) => void
  setEquipment: (equipment: EquipmentSlot[] | ((prev: EquipmentSlot[]) => EquipmentSlot[])) => void
  setIsDarkMode: (isDarkMode: boolean | ((prev: boolean) => boolean)) => void
}

// 덱 빌더 컨텍스트 타입
export interface DeckBuilderContext extends DeckBuilderState, DeckBuilderActions {
  data: Database | null
}

// 결과 타입
export type Result = {
  success: boolean
  message: string
  url?: string
}

