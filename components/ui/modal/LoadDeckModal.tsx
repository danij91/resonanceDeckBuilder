"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Modal } from "./Modal"
import { getSavedDecks, deleteDeck } from "../../../utils/local-storage"
import type { SavedDeck } from "../../../utils/local-storage"
import { Trash2, Share2 } from "lucide-react"

interface LoadDeckModalProps {
  isOpen: boolean
  onClose: () => void
  getTranslatedString: (key: string) => string
  onLoadDeck: (deck: SavedDeck) => void
  onDeleteDeck: (deckId: string) => void
  onShareDeck?: (deck: SavedDeck) => void // 공유 기능 추가
}

export function LoadDeckModal({
  isOpen,
  onClose,
  getTranslatedString,
  onLoadDeck,
  onDeleteDeck,
  onShareDeck,
}: LoadDeckModalProps) {
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)

  // 모달이 열릴 때 저장된 덱 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadSavedDecks()
    }
  }, [isOpen])

  // 저장된 덱 목록 로드
  const loadSavedDecks = () => {
    const decks = getSavedDecks()
    // 최신 수정일 기준으로 정렬
    decks.sort((a, b) => b.updatedAt - a.updatedAt)
    setSavedDecks(decks)

    // 첫 번째 덱 선택 (있는 경우)
    if (decks.length > 0) {
      setSelectedDeckId(decks[0].id)
    } else {
      setSelectedDeckId(null)
    }
  }

  // 덱 불러오기 처리
  const handleLoadDeck = () => {
    if (!selectedDeckId) return

    const deck = savedDecks.find((deck) => deck.id === selectedDeckId)
    if (deck) {
      onLoadDeck(deck)
      onClose()
    }
  }

  // 덱 삭제 처리
  const handleDeleteDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation() // 클릭 이벤트 전��� 방지

    if (confirm(getTranslatedString("confirm_delete_deck") || "Are you sure you want to delete this deck?")) {
      const success = deleteDeck(deckId)
      if (success) {
        onDeleteDeck(deckId)
        loadSavedDecks() // 덱 목록 다시 로드
      }
    }
  }

  // 덱 공유 처리
  const handleShareDeck = (deck: SavedDeck, e: React.MouseEvent) => {
    e.stopPropagation() // 클릭 이벤트 전파 방지

    if (onShareDeck) {
      onShareDeck(deck)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<h3 className="text-lg font-bold neon-text">{getTranslatedString("load_deck")}</h3>}
      maxWidth="max-w-2xl"
    >
      <div className="p-4">
        {savedDecks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {getTranslatedString("no_saved_decks") || "No saved decks found"}
          </div>
        ) : (
          <div className="mb-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              {savedDecks.map((deck) => (
                <div
                  key={deck.id}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                    selectedDeckId === deck.id
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-[hsla(var(--neon-white),0.3)] hover:border-[hsla(var(--neon-white),0.5)]"
                  }`}
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{deck.name}</div>
                    <div className="flex items-center space-x-2">
                      {/* 공유 버튼 추가 */}
                      {onShareDeck && (
                        <button
                          onClick={(e) => handleShareDeck(deck, e)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title={getTranslatedString("share") || "Share"}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => handleDeleteDeck(deck.id, e)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title={getTranslatedString("delete_deck")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {getTranslatedString("last_updated") || "Last updated"}: {formatDate(deck.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[hsla(var(--neon-white),0.3)] rounded-md hover:bg-[hsla(var(--neon-white),0.1)]"
          >
            {getTranslatedString("cancel")}
          </button>
          <button
            onClick={handleLoadDeck}
            disabled={!selectedDeckId}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              selectedDeckId ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
            }`}
          >
            {getTranslatedString("load")}
          </button>
        </div>
      </div>
    </Modal>
  )
}
