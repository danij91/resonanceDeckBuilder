"use client"

import { useState, useRef } from "react"
import type { Character, Card, Equipment } from "../types"
import { CharacterSlot } from "./character-slot"
import { CharacterSearchModal } from "./ui/modal/CharacterSearchModal"

interface CharacterWindowProps {
  selectedCharacters: number[]
  leaderCharacter: number
  onAddCharacter: (characterId: number, slot: number) => void
  onRemoveCharacter: (slot: number) => void
  onSetLeader: (characterId: number) => void
  getCharacter: (id: number) => Character | null
  getTranslatedString: (key: string) => string
  availableCharacters: Character[]
  equipment: Array<{
    weapon: string | null
    armor: string | null
    accessory: string | null
  }>
  onEquipItem: (slotIndex: number, equipType: "weapon" | "armor" | "accessory", equipId: string | null) => void
  getCardInfo: (cardId: string) => { card: Card } | null
  getEquipment: (equipId: string) => Equipment | null
  equipments?: Equipment[]
  data: any
  getSkill?: (skillId: number) => any // getSkill 추가
}

export function CharacterWindow({
  selectedCharacters,
  leaderCharacter,
  onAddCharacter,
  onRemoveCharacter,
  onSetLeader,
  getCharacter,
  getTranslatedString,
  availableCharacters,
  equipment,
  onEquipItem,
  getCardInfo,
  getEquipment,
  equipments = [],
  data,
  getSkill, // getSkill 추가
}: CharacterWindowProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number>(-1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "rarity">("rarity")
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("asc")
  const modalRef = useRef<HTMLDivElement>(null)
  const [slotHasExistingCharacter, setSlotHasExistingCharacter] = useState(false)

  const handleOpenSelector = (slot: number) => {
    // 슬롯에 이미 캐릭터가 있는지 확인
    const hasExistingCharacter = selectedCharacters[slot] !== -1
    setSlotHasExistingCharacter(hasExistingCharacter)

    // 슬롯 정보 저장 및 검색 모달 열기
    setSelectedSlot(slot)
    setSearchTerm("")
    setShowSelector(true)
  }

  const handleCharacterSelect = (characterId: number) => {
    if (selectedSlot !== -1) {
      // 슬롯에 이미 캐릭터가 있었다면 먼저 제거
      if (slotHasExistingCharacter) {
        onRemoveCharacter(selectedSlot)
      }

      // 새 캐릭터 추가
      onAddCharacter(characterId, selectedSlot)
      setShowSelector(false)
      setSelectedSlot(-1)
      setSlotHasExistingCharacter(false)
    }
  }

  // Filter out already selected characters to prevent duplicates
  const availableForSelection = availableCharacters.filter((character) => !selectedCharacters.includes(character.id))

  // Filter by search term
  const filteredCharacters = availableForSelection.filter((character) =>
    getTranslatedString(character.name).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Update the sort function to respect direction
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    let result = 0

    if (sortBy === "name") {
      result = getTranslatedString(a.name).localeCompare(getTranslatedString(b.name))
    } else {
      // Sort by rarity (UR > SSR > SR > R)
      const rarityOrder = { UR: 4, SSR: 3, SR: 2, R: 1 }
      result =
        (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
        (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)
    }
    // Apply sort direction
    return sortDirection === "asc" ? result : -result
  })

  // Function to get rarity border color
  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case "UR":
        return "border-orange-500"
      case "SSR":
        return "border-yellow-500"
      case "SR":
        return "border-purple-500"
      case "R":
        return "border-blue-500"
      default:
        return "border-gray-700"
    }
  }

  // Check if any character slot is filled
  const hasAnyCharacter = selectedCharacters.some((id) => id !== -1)

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
        {selectedCharacters.map((characterId, index) => (
          <CharacterSlot
            key={index}
            index={index}
            characterId={characterId}
            onAddCharacter={() => handleOpenSelector(index)}
            onRemoveCharacter={() => onRemoveCharacter(index)}
            character={getCharacter(characterId)}
            getTranslatedString={getTranslatedString}
            equipment={equipment[index]}
            onEquipItem={onEquipItem}
            isLeader={characterId === leaderCharacter}
            onSetLeader={() => onSetLeader(characterId)}
            getCardInfo={getCardInfo}
            getEquipment={getEquipment}
            equipments={equipments}
            data={data}
            getSkill={getSkill} // getSkill 전달
            hasAnyCharacter={hasAnyCharacter}
          />
        ))}
      </div>

      {/* 새로운 캐릭터 검색 모달 컴포넌트 사용 */}
      <CharacterSearchModal
        isOpen={showSelector}
        onClose={() => {
          setShowSelector(false)
          setSelectedSlot(-1)
          setSlotHasExistingCharacter(false)
        }}
        title={
          <h3 className="text-lg font-bold neon-text">
            {getTranslatedString("select_character") || "Select Character"}
          </h3>
        }
        searchControl={{
          searchTerm,
          onSearchChange: setSearchTerm,
          sortBy,
          onSortByChange: setSortBy,
          sortDirection,
          onSortDirectionChange: () => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc")),
          sortOptions: [
            { value: "rarity", label: getTranslatedString("sort_by_rarity") || "Sort by Rarity" },
            { value: "name", label: getTranslatedString("sort_by_name") || "Sort by Name" },
          ],
          searchPlaceholder: getTranslatedString("search_characters") || "Search characters",
        }}
        characters={sortedCharacters}
        onSelectCharacter={handleCharacterSelect}
        getTranslatedString={getTranslatedString}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowSelector(false)
                setSelectedSlot(-1)
                setSlotHasExistingCharacter(false)
              }}
              className="neon-button px-4 py-2 rounded-lg text-sm"
            >
              {getTranslatedString("close") || "Close"}
            </button>
          </div>
        }
      />
    </div>
  )
}

