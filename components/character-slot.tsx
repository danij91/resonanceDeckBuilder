"use client"

import type React from "react"

import { Plus, Info, X, Crown, ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"
import type { Character, Equipment, Card, CardExtraInfo } from "../types"
import { CharacterDetails } from "./character-details"
import { EquipmentDetails } from "./equipment-details"

interface CharacterSlotProps {
  index: number
  characterId: number
  onAddCharacter: () => void
  onRemoveCharacter: () => void
  character: Character | null
  getTranslatedString: (key: string) => string
  equipment: {
    weapon: string | null
    armor: string | null
    accessory: string | null
  }
  onEquipItem: (slotIndex: number, equipType: "weapon" | "armor" | "accessory", equipId: string | null) => void
  getEquipment: (id: string) => Equipment | null
  isLeader: boolean
  onSetLeader: () => void
  getCardInfo: (cardId: string) => { card: Card; extraInfo: CardExtraInfo } | null
  data: any
}

export function CharacterSlot({
  index,
  characterId,
  onAddCharacter,
  onRemoveCharacter,
  character,
  getTranslatedString,
  equipment,
  onEquipItem,
  getEquipment,
  isLeader,
  onSetLeader,
  getCardInfo,
  data,
}: CharacterSlotProps) {
  const isEmpty = characterId === -1
  const [showEquipmentSelector, setShowEquipmentSelector] = useState<"weapon" | "armor" | "accessory" | null>(null)
  const [showCharacterDetails, setShowCharacterDetails] = useState(false)
  const [showEquipmentDetails, setShowEquipmentDetails] = useState<string | null>(null)

  const handleEquipmentClick = (type: "weapon" | "armor" | "accessory") => {
    if (isEmpty) return
    setShowEquipmentSelector(type)
  }

  const handleEquipItem = (equipId: string | null) => {
    if (showEquipmentSelector && !isEmpty) {
      onEquipItem(index, showEquipmentSelector, equipId)
      setShowEquipmentSelector(null)
    }
  }

  const handleEquipmentInfoClick = (e: React.MouseEvent, equipId: string) => {
    e.stopPropagation()
    setShowEquipmentDetails(equipId)
  }

  // Function to get rarity badge color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "UR":
        return "bg-gradient-to-r from-orange-500 to-amber-500"
      case "SSR":
        return "bg-gradient-to-r from-yellow-500 to-amber-500"
      case "SR":
        return "bg-gradient-to-r from-purple-500 to-indigo-500"
      case "R":
        return "bg-gradient-to-r from-blue-500 to-cyan-500"
      default:
        return "bg-gray-500"
    }
  }

  // Function to get rarity background color for equipment
  const getEquipmentRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case "UR":
        return "bg-gradient-to-br from-orange-500 to-amber-500"
      case "SSR":
        return "bg-gradient-to-br from-yellow-500 to-amber-500"
      case "SR":
        return "bg-gradient-to-br from-purple-500 to-indigo-500"
      case "R":
        return "bg-gradient-to-br from-blue-500 to-cyan-500"
      default:
        return "bg-gray-700"
    }
  }

  return (
    <div className="flex flex-col">
      {/* Character Card */}
      <div
        className={`
          relative w-full aspect-[3/4] rounded-lg border border-gray-700 overflow-hidden
          ${isEmpty ? "flex items-center justify-center cursor-pointer hover:bg-gray-700" : ""}
          ${isLeader ? "ring-2 ring-yellow-400" : ""}
        `}
        onClick={isEmpty ? onAddCharacter : undefined}
      >
        {isEmpty ? (
          <Plus className="w-8 h-8 text-gray-400" />
        ) : character ? (
          <div className="w-full h-full relative">
            {/* Character background image - now fully opaque */}
            <div className="absolute inset-0 w-full h-full">
              {character.img_card && (
                <img
                  src={character.img_card || "/placeholder.svg"}
                  alt={getTranslatedString(character.name)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Overlay - reduced opacity for better visibility */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>

            {/* Content */}
            <div className="relative z-10 p-3 flex flex-col h-full">
              {/* Top section - Name and Rarity */}
              <div className="flex items-center mb-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full text-white mr-2 ${getRarityColor(character.rarity)}`}
                >
                  {character.rarity}
                </span>
                <h3 className="text-base font-semibold text-white">{getTranslatedString(character.name)}</h3>
              </div>

              {/* Bottom section - Buttons */}
              <div className="mt-auto flex justify-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCharacterDetails(true)
                  }}
                  className="text-white hover:text-blue-300"
                  aria-label={getTranslatedString("character.details") || "Character details"}
                >
                  <Info className="w-5 h-5" />
                </button>

                {!isLeader && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSetLeader()
                    }}
                    className="text-white hover:text-yellow-300"
                    aria-label={getTranslatedString("set_as_leader") || "Set as leader"}
                  >
                    <Crown className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveCharacter()
                  }}
                  className="text-white hover:text-red-300"
                  aria-label={getTranslatedString("remove_character") || "Remove character"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Equipment Slots */}
      <div className="mt-2 grid grid-cols-3 gap-1">
        {/* Weapon Slot */}
        <div
          className={`
            w-full aspect-square rounded-lg overflow-hidden cursor-pointer
            ${isEmpty ? "opacity-50 pointer-events-none" : ""}
            ${!equipment.weapon ? "bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center" : ""}
          `}
          onClick={() => handleEquipmentClick("weapon")}
        >
          {equipment.weapon && getEquipment(equipment.weapon) ? (
            <div className="relative w-full h-full group">
              <div
                className={`w-full h-full ${getEquipmentRarityBgColor(getEquipment(equipment.weapon)?.rarity || "")}`}
              >
                {getEquipment(equipment.weapon)?.url ? (
                  <img
                    src={getEquipment(equipment.weapon)?.url || ""}
                    alt={getTranslatedString(getEquipment(equipment.weapon)?.name || "")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs">W</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => handleEquipmentInfoClick(e, equipment.weapon!)}
                  className="text-white hover:text-blue-300"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-500">1</span>
          )}
        </div>

        {/* Armor Slot */}
        <div
          className={`
            w-full aspect-square rounded-lg overflow-hidden cursor-pointer
            ${isEmpty ? "opacity-50 pointer-events-none" : ""}
            ${!equipment.armor ? "bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center" : ""}
          `}
          onClick={() => handleEquipmentClick("armor")}
        >
          {equipment.armor && getEquipment(equipment.armor) ? (
            <div className="relative w-full h-full group">
              <div
                className={`w-full h-full ${getEquipmentRarityBgColor(getEquipment(equipment.armor)?.rarity || "")}`}
              >
                {getEquipment(equipment.armor)?.url ? (
                  <img
                    src={getEquipment(equipment.armor)?.url || ""}
                    alt={getTranslatedString(getEquipment(equipment.armor)?.name || "")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs">A</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => handleEquipmentInfoClick(e, equipment.armor!)}
                  className="text-white hover:text-blue-300"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-500">2</span>
          )}
        </div>

        {/* Accessory Slot */}
        <div
          className={`
            w-full aspect-square rounded-lg overflow-hidden cursor-pointer
            ${isEmpty ? "opacity-50 pointer-events-none" : ""}
            ${!equipment.accessory ? "bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center" : ""}
          `}
          onClick={() => handleEquipmentClick("accessory")}
        >
          {equipment.accessory && getEquipment(equipment.accessory) ? (
            <div className="relative w-full h-full group">
              <div
                className={`w-full h-full ${getEquipmentRarityBgColor(getEquipment(equipment.accessory)?.rarity || "")}`}
              >
                {getEquipment(equipment.accessory)?.url ? (
                  <img
                    src={getEquipment(equipment.accessory)?.url || ""}
                    alt={getTranslatedString(getEquipment(equipment.accessory)?.name || "")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs">A</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => handleEquipmentInfoClick(e, equipment.accessory!)}
                  className="text-white hover:text-blue-300"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-500">3</span>
          )}
        </div>
      </div>

      {/* Equipment Selector Modal */}
      {showEquipmentSelector && (
        <EquipmentSelector
          type={showEquipmentSelector}
          onSelect={handleEquipItem}
          onClose={() => setShowEquipmentSelector(null)}
          getEquipment={getEquipment}
          getTranslatedString={getTranslatedString}
          data={Object.values(data?.equipment || {}).filter(
            (eq) => eq.type === (showEquipmentSelector === "accessory" ? "acc" : showEquipmentSelector),
          )}
        />
      )}

      {/* Character Details Modal */}
      {showCharacterDetails && character && (
        <CharacterDetails
          character={character}
          getTranslatedString={getTranslatedString}
          onClose={() => setShowCharacterDetails(false)}
          getCardInfo={getCardInfo}
        />
      )}

      {/* Equipment Details Modal */}
      {showEquipmentDetails && (
        <EquipmentDetails
          equipment={getEquipment(showEquipmentDetails)!}
          getTranslatedString={getTranslatedString}
          onClose={() => setShowEquipmentDetails(null)}
        />
      )}
    </div>
  )
}

interface EquipmentSelectorProps {
  type: "weapon" | "armor" | "accessory"
  onSelect: (equipId: string | null) => void
  onClose: () => void
  getEquipment: (id: string) => Equipment | null
  getTranslatedString: (key: string) => string
  data: Equipment[]
}

function EquipmentSelector({
  type,
  onSelect,
  onClose,
  getEquipment,
  getTranslatedString,
  data,
}: EquipmentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "rarity">("rarity")
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("asc")

  const filteredData = data.filter((item) =>
    getTranslatedString(item.name).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Update the sort function to respect direction
  const sortedData = [...filteredData].sort((a, b) => {
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

  // Function to get rarity background color
  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case "UR":
        return "bg-gradient-to-br from-orange-500 to-amber-500"
      case "SSR":
        return "bg-gradient-to-br from-yellow-500 to-amber-500"
      case "SR":
        return "bg-gradient-to-br from-purple-500 to-indigo-500"
      case "R":
        return "bg-gradient-to-br from-blue-500 to-cyan-500"
      default:
        return "bg-gray-700"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose} >

      <div
        className="bg-gray-800 p-4 rounded-lg max-w-3xl max-h-[80vh] w-full flex flex-col"
        style={{ aspectRatio: "1/0.8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-grow overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">
            {getTranslatedString(`select_${type}`) || `Select ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </h3>

          {/* Updated search and sort controls */}
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getTranslatedString("search") || "Search"}
                className="w-full pl-4 pr-4 py-2 h-10 bg-gray-700 border border-gray-600 rounded-md text-sm"
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

          {/* Update the equipment cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* None option */}
            <div onClick={() => onSelect(null)} className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center cursor-pointer hover:bg-gray-600">
                <span className="text-lg">✕</span>
              </div>
              <div className="text-xs font-medium text-center">{getTranslatedString("none") || "None"}</div>
            </div>

            {sortedData.map((item) => (
              <div key={item.id} onClick={() => onSelect(item.id)} className="w-full">
                <div
                  className={`relative w-full aspect-square ${getRarityBgColor(item.rarity)} rounded-lg overflow-hidden cursor-pointer hover:opacity-80`}
                >
                  {item.url ? (
                    <img
                      src={item.url || "/placeholder.svg"}
                      alt={getTranslatedString(item.name)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs">{getTranslatedString(item.name).charAt(0)}</span>
                    </div>
                  )}

                  {/* Name at the bottom inside the card */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1 text-center">
                    <div className="text-xs font-medium text-white truncate">{getTranslatedString(item.name)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 닫기 버튼 스타일 통일 */}
        <div className="border-t border-gray-700 pt-4 mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
            {getTranslatedString("close") || "Close"}
          </button>
        </div>
      </div>
    </div>
  )
}

