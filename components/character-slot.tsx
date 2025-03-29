"use client"

import { Plus, Info, X, Crown } from "lucide-react"
import { useState } from "react"
import type { Character, Card, Equipment } from "../types"
import { CharacterDetails } from "./character-details"
import { EquipmentSelector } from "./equipment-selector"
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
  isLeader: boolean
  onSetLeader: () => void
  getCardInfo: (cardId: string) => { card: Card } | null
  getSkill?: (skillId: number) => any // getSkill 추가
  getEquipment: (equipId: string) => Equipment | null
  equipments?: Equipment[]
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
  isLeader,
  onSetLeader,
  getCardInfo,
  getSkill,
  getEquipment,
  equipments = [], // Provide default empty array
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

  // Function to get equipment quality background color
  const getEquipmentQualityBgColor = (quality: string) => {
    switch (quality) {
      case "Orange":
        return "bg-gradient-to-br from-orange-500 to-red-500"
      case "Golden":
        return "bg-gradient-to-br from-yellow-500 to-amber-500"
      case "Purple":
        return "bg-gradient-to-br from-purple-500 to-indigo-500"
      case "Blue":
        return "bg-gradient-to-br from-blue-500 to-cyan-500"
      case "Green":
        return "bg-gradient-to-br from-green-500 to-emerald-500"
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-500"
    }
  }

  // Get equipment details
  const weaponEquipment = equipment.weapon ? getEquipment(equipment.weapon) : null
  const armorEquipment = equipment.armor ? getEquipment(equipment.armor) : null
  const accessoryEquipment = equipment.accessory ? getEquipment(equipment.accessory) : null

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
            ${!weaponEquipment ? "bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center" : getEquipmentQualityBgColor(weaponEquipment.quality)}
          `}
          onClick={() => handleEquipmentClick("weapon")}
        >
          {!weaponEquipment ? (
            <span className="text-xs text-gray-500">1</span>
          ) : (
            <div className="w-full h-full relative">
              <img
                src={weaponEquipment.url || `/placeholder.svg?height=100&width=100`}
                alt={getTranslatedString(weaponEquipment.name)}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute bottom-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.weapon)
                }}
              >
                <Info className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Armor Slot */}
        <div
          className={`
            w-full aspect-square rounded-lg overflow-hidden cursor-pointer
            ${isEmpty ? "opacity-50 pointer-events-none" : ""}
            ${!armorEquipment ? "bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center" : getEquipmentQualityBgColor(armorEquipment.quality)}
          `}
          onClick={() => handleEquipmentClick("armor")}
        >
          {!armorEquipment ? (
            <span className="text-xs text-gray-500">2</span>
          ) : (
            <div className="w-full h-full relative">
              <img
                src={armorEquipment.url || `/placeholder.svg?height=100&width=100`}
                alt={getTranslatedString(armorEquipment.name)}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute bottom-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.armor)
                }}
              >
                <Info className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Accessory Slot */}
        <div
          className={`
            w-full aspect-square rounded-lg overflow-hidden cursor-pointer
            ${isEmpty ? "opacity-50 pointer-events-none" : ""}
            ${!accessoryEquipment ? "bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center" : getEquipmentQualityBgColor(accessoryEquipment.quality)}
          `}
          onClick={() => handleEquipmentClick("accessory")}
        >
          {!accessoryEquipment ? (
            <span className="text-xs text-gray-500">3</span>
          ) : (
            <div className="w-full h-full relative">
              <img
                src={accessoryEquipment.url || `/placeholder.svg?height=100&width=100`}
                alt={getTranslatedString(accessoryEquipment.name)}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute bottom-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.accessory)
                }}
              >
                <Info className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Selector Modal */}
      {showEquipmentSelector && (
        <EquipmentSelector
          type={showEquipmentSelector}
          onSelect={handleEquipItem}
          onClose={() => setShowEquipmentSelector(null)}
          getTranslatedString={getTranslatedString}
          equipments={Object.values(data.equipments)}
        />
      )}

      {/* Character Details Modal */}
      {showCharacterDetails && character && (
        <CharacterDetails
          character={character}
          getTranslatedString={getTranslatedString}
          onClose={() => setShowCharacterDetails(false)}
          getCardInfo={getCardInfo}
          getSkill={getSkill}
          data={data} // data 전달
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

