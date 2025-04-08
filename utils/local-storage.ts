import type { Preset } from "../types"

// 로컬스토리지 키 상수
const DECKS_STORAGE_KEY = "resonance_saved_decks"
const CURRENT_DECK_KEY = "resonance_current_deck"

// 저장된 덱 타입 정의
export interface SavedDeck {
  id: string
  name: string
  preset: Preset
  createdAt: number
  updatedAt: number
}

// 모든 저장된 덱 가져오기
export function getSavedDecks(): SavedDeck[] {
  try {
    const decksJson = localStorage.getItem(DECKS_STORAGE_KEY)
    if (!decksJson) return []
    return JSON.parse(decksJson)
  } catch (error) {
    console.error("Failed to get saved decks:", error)
    return []
  }
}

// 특정 ID의 덱 가져오기
export function getSavedDeckById(id: string): SavedDeck | null {
  const decks = getSavedDecks()
  return decks.find((deck) => deck.id === id) || null
}

// 덱 저장하기
export function saveDeck(name: string, preset: Preset, deckId?: string): SavedDeck {
  try {
    const decks = getSavedDecks()
    const now = Date.now()

    // 새 덱 ID 생성 또는 기존 ID 사용
    const id = deckId || `deck_${now}_${Math.random().toString(36).substring(2, 9)}`

    // 기존 덱 찾기
    const existingDeckIndex = decks.findIndex((deck) => deck.id === id)

    // 새 덱 객체 생성
    const newDeck: SavedDeck = {
      id,
      name: name,
      preset,
      createdAt: existingDeckIndex >= 0 ? decks[existingDeckIndex].createdAt : now,
      updatedAt: now,
    }

    // 기존 덱 업데이트 또는 새 덱 추가
    if (existingDeckIndex >= 0) {
      decks[existingDeckIndex] = newDeck
    } else {
      decks.push(newDeck)
    }

    // 로컬스토리지에 저장
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks))

    // 현재 편집 중인 덱 ID 저장
    setCurrentDeckId(id)

    return newDeck
  } catch (error) {
    console.error("Failed to save deck:", error)
    throw new Error("Failed to save deck")
  }
}

// 덱 삭제하기
export function deleteDeck(id: string): boolean {
  try {
    const decks = getSavedDecks()
    const filteredDecks = decks.filter((deck) => deck.id !== id)

    // 덱이 존재하지 않으면 false 반환
    if (filteredDecks.length === decks.length) return false

    // 로컬스토리지에 저장
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(filteredDecks))

    // 현재 편집 중인 덱이 삭제된 덱이면 현재 덱 ID 제거
    if (getCurrentDeckId() === id) {
      removeCurrentDeckId()
    }

    return true
  } catch (error) {
    console.error("Failed to delete deck:", error)
    return false
  }
}

// 현재 편집 중인 덱 ID 저장
export function setCurrentDeckId(id: string): void {
  localStorage.setItem(CURRENT_DECK_KEY, id)
}

// 현재 편집 중인 덱 ID 가져오기
export function getCurrentDeckId(): string | null {
  return localStorage.getItem(CURRENT_DECK_KEY)
}

// 현재 편집 중인 덱 ID 제거
export function removeCurrentDeckId(): void {
  localStorage.removeItem(CURRENT_DECK_KEY)
}

// 현재 편집 중인 덱 가져오기
export function getCurrentDeck(): SavedDeck | null {
  const currentId = getCurrentDeckId()
  if (!currentId) return null
  return getSavedDeckById(currentId)
}
