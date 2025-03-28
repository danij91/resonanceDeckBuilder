"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import type { Character, Equipment, Card, CardExtraInfo } from "../types"
import { CharacterSlot } from "./character-slot"

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
  getEquipment: (id: string) => Equipment | null
  getCardInfo: (cardId: string) => { card: Card; extraInfo: CardExtraInfo } | null
  data: any
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
  getEquipment,
  getCardInfo,
  data,
}: CharacterWindowProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number>(-1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "rarity">("rarity")
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("asc")

  const handleOpenSelector = (slot: number) => {
    setSelectedSlot(slot)
    setSearchTerm("")
    setShowSelector(true)
  }

  const handleCharacterSelect = (characterId: number) => {
    if (selectedSlot !== -1) {
      onAddCharacter(characterId, selectedSlot)
      setShowSelector(false)
      setSelectedSlot(-1)
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

  return (
    <div className="w-full" >
      <h2 className="text-xl font-bold mb-4">{getTranslatedString("character.section.title") || "Characters"}</h2>

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
            getEquipment={getEquipment}
            isLeader={characterId === leaderCharacter}
            onSetLeader={() => onSetLeader(characterId)}
            getCardInfo={getCardInfo}
            data={data}
          />
        ))}
      </div>

      {/* Character Selector Modal */}
      {showSelector && (
        <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        onClick={() => {
          setShowSelector(false)
          setSelectedSlot(-1)
        }}
      >
           <div
      className="bg-gray-800 p-4 rounded-lg max-w-3xl w-full flex flex-col max-h-[90vh]"
      style={{ aspectRatio: "1/0.8" }}
      onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
    >
            <div className="flex-grow overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">
                {getTranslatedString("select_character") || "Select Character"}
              </h3>

              {/* Updated search and sort controls */}
              <div className="mb-4 flex items-center space-x-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={getTranslatedString("search_characters") || "Search characters"}
                    className="w-full pl-8 pr-4 py-2 h-10 bg-gray-700 border border-gray-600 rounded-md text-sm"
                  />
                </div>

                <div className="flex h-10">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "rarity")}
                    className="p-2 h-full bg-gray-700 border border-gray-600 border-r-0 rounded-l-md text-sm appearance-none pl-3 pr-8"
                    style={{ WebkitAppearance: "none" }}
                  >
                    <option value="rarity">{getTranslatedString("sort_by_rarity") || "Sort by Rarity"}</option>
                    <option value="name">{getTranslatedString("sort_by_name") || "Sort by Name"}</option>
                  </select>

                  <div className="h-full w-px bg-gray-600"></div>

                  <button
                    onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="h-full px-3 bg-gray-700 border border-gray-600 border-l-0 rounded-r-md flex items-center justify-center"
                    aria-label={sortDirection === "asc" ? "Sort Descending" : "Sort Ascending"}
                  >
                    {sortDirection === "desc" ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sortedCharacters.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-gray-400">
                    {getTranslatedString("no_characters_found") || "No characters found"}
                  </div>
                ) : (
                  sortedCharacters.map((character) => (
                    <div
                      key={character.id}
                      onClick={() => handleCharacterSelect(character.id)}
                      className="cursor-pointer"
                    >
                      <div
                        className={`relative w-full aspect-[3/4] rounded-lg border-2 ${getRarityBorderColor(character.rarity)} overflow-hidden hover:opacity-80`}
                      >
                        {/* Character background image */}
                        <div className="absolute inset-0 w-full h-full">
                          {character.img_card && (
                            <img
                              src={character.img_card || "/placeholder.svg"}
                              alt={getTranslatedString(character.name)}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                        {/* Content */}
                        <div className="relative z-10 p-3 flex flex-col h-full">
                          {/* Name */}
                          <h3 className="text-base font-semibold text-white">{getTranslatedString(character.name)}</h3>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowSelector(false)
                  setSelectedSlot(-1)
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg text-sm"
              >
                {getTranslatedString("close") || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

