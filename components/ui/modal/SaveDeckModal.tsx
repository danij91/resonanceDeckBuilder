"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Modal } from "./Modal"
import { saveDeck, getSavedDecks, getCurrentDeckId } from "../../../utils/local-storage"
import type { Preset } from "../../../types"

interface SaveDeckModalProps {
  isOpen: boolean
  onClose: () => void
  preset: Preset
  getTranslatedString: (key: string) => string
  onSaveSuccess: (deckId: string) => void
  getCharacterName: (id: number) => string
}

export function SaveDeckModal({
  isOpen,
  onClose,
  preset,
  getTranslatedString,
  onSaveSuccess,
  getCharacterName,
}: SaveDeckModalProps) {
  const [deckName, setDeckName] = useState("")
  const [savedDecks, setSavedDecks] = useState<{ id: string; name: string }[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [isNewDeck, setIsNewDeck] = useState(true)
  const [placeholderName, setPlaceholderName] = useState("")

  // 모달이 열릴 때 저장된 덱 목록 로드 및 기본 덱 이름 설정
  useEffect(() => {
    if (isOpen) {
      // 저장된 덱 목록 로드
      const decks = getSavedDecks().map((deck) => ({ id: deck.id, name: deck.name }))
      setSavedDecks(decks)

      // 현재 편집 중인 덱 ID 가져오기
      const currentDeckId = getCurrentDeckId()
      setSelectedDeckId(currentDeckId)
      setIsNewDeck(!currentDeckId)

      // 항상 현재 덱 구성을 기반으로 기본 이름 생성
      const defaultName = generateDefaultDeckName(preset)
      setPlaceholderName(defaultName)

      // 현재 선택된 덱이 있으면 해당 덱 이름을 입력 필드에 설정
      if (currentDeckId) {
        const currentDeck = decks.find((deck) => deck.id === currentDeckId)
        if (currentDeck) {
          setDeckName(currentDeck.name)
        }
      } else {
        // 새 덱인 경우 이름 필드를 비워서 placeholder가 보이도록 함
        setDeckName("")
      }
    }
  }, [isOpen, preset, getCharacterName])

  // 기본 덱 이름 생성 함수
  const generateDefaultDeckName = (preset: Preset): string => {
    try {
      // 리더 캐릭터 이름
      const leaderName = preset.header !== -1 ? getCharacterName(preset.header) : ""

      // 나머지 캐릭터 이름들 (빈 슬롯 제외)
      const otherCharNames = preset.roleList
        .filter((charId) => charId !== -1 && charId !== preset.header)
        .map((charId) => getCharacterName(charId))
        .filter((name) => name) // 빈 이름 제외
        .join(", ")

      // 리더 이름 - 나머지 캐릭터 이름들
      if (leaderName) {
        return otherCharNames ? `${leaderName} - ${otherCharNames}` : leaderName
      }

      // 리더가 없지만 다른 캐릭터가 있는 경우
      if (otherCharNames) {
        return otherCharNames
      }

      // 아무 캐릭터도 없는 경우
      return getTranslatedString("new_deck")
    } catch (error) {
      console.error("Error generating default deck name:", error)
      return getTranslatedString("new_deck")
    }
  }

  // 덱 저장 처리
  const handleSaveDeck = () => {
    try {
      // 덱 이름이 비어있으면 placeholder 이름 사용
      const nameToUse = deckName.trim() || placeholderName

      // 덱 저장
      const deckId = !isNewDeck && selectedDeckId ? selectedDeckId : undefined
      const savedDeck = saveDeck(nameToUse, preset, deckId)

      // 성공 콜백 호출
      onSaveSuccess(savedDeck.id)

      // 모달 닫기
      onClose()
    } catch (error) {
      console.error("Failed to save deck:", error)
      // 에러 처리 (실제 구현에서는 에러 메시지 표시 등 추가)
    }
  }

  // 덱 선택 변경 처리
  const handleDeckSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === "new") {
      setIsNewDeck(true)
      setSelectedDeckId(null)
      setDeckName("") // 이름 필드를 비워서 placeholder가 보이도록 함
    } else {
      setIsNewDeck(false)
      setSelectedDeckId(value)
      // 선택한 덱의 이름을 입력 필드에 설정
      const selectedDeck = savedDecks.find((deck) => deck.id === value)
      if (selectedDeck) {
        setDeckName(selectedDeck.name)
      }
    }
  }

  // 현재 선택된 덱 ID
  const currentDeckId = getCurrentDeckId()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<h3 className="text-lg font-bold neon-text">{getTranslatedString("save_deck")}</h3>}
      maxWidth="max-w-md"
    >
      <div className="p-4">
        {/* 덱 선택 (새 덱 또는 기존 덱 덮어쓰기) */}
        <div className="mb-4">
          <label htmlFor="deck-selection" className="block text-sm font-medium mb-1">
            {getTranslatedString("deck_selection") || "Deck Selection"}
          </label>
          <select
            id="deck-selection"
            className="w-full p-2 bg-black border border-[hsla(var(--neon-white),0.3)] rounded-md"
            value={isNewDeck ? "new" : selectedDeckId || "new"}
            onChange={handleDeckSelectionChange}
          >
            <option value="new">{getTranslatedString("new_deck")}</option>
            {savedDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
                {deck.id === currentDeckId ? ` (${getTranslatedString("selected") || "선택됨"})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 덱 이름 입력 */}
        <div className="mb-4">
          <label htmlFor="deck-name" className="block text-sm font-medium mb-1">
            {getTranslatedString("deck_name")}
          </label>
          <input
            id="deck-name"
            type="text"
            className="w-full p-2 bg-black border border-[hsla(var(--neon-white),0.3)] rounded-md"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder={placeholderName}
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[hsla(var(--neon-white),0.3)] rounded-md hover:bg-[hsla(var(--neon-white),0.1)]"
          >
            {getTranslatedString("cancel")}
          </button>
          <button onClick={handleSaveDeck} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {getTranslatedString("save")}
          </button>
        </div>
      </div>
    </Modal>
  )
}
