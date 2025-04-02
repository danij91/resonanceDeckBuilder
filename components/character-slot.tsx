"use client"

import { Plus, Info, X, Crown } from "lucide-react"
import { useState } from "react"
import type { Character, Card, Equipment } from "../types"
import { EquipmentSearchModal } from "./ui/modal/EquipmentSearchModal"
import { CharacterDetailsModal } from "./character-details-modal"
import { EquipmentDetailsModal } from "./equipment-details-modal"

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
  hasAnyCharacter: boolean
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
  hasAnyCharacter,
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

  // Leader style class - only apply if the character is a leader and not empty
  const leaderStyleClass =
    !isEmpty && isLeader
      ? "ring-2 ring-[#ff0000] scale-105 shadow-[0_0_10px_2px_rgba(255,0,0,0.7)] z-10 transform transition-transform duration-200"
      : ""

  return (
    <div className="flex flex-col">
      {/* Character Card */}
      <div
        className={`
          relative w-full aspect-[3/4] rounded-lg overflow-hidden
          ${
            isEmpty
              ? hasAnyCharacter
                ? "flex items-center justify-center cursor-pointer border border-[hsla(var(--neon-white),0.3)] bg-black bg-opacity-70 hover:bg-opacity-60"
                : "flex items-center justify-center cursor-pointer character-slot-empty"
              : "cursor-pointer character-slot-filled"
          }
          ${leaderStyleClass}
        `}
        onClick={onAddCharacter}
      >
        {isEmpty ? (
          <Plus className="w-8 h-8 text-[hsl(var(--neon-white))]" />
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
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>

            {/* Content */}
            <div className="relative z-10 p-3 flex flex-col h-full">
              {/* Top section - Name and Rarity */}
              <div className="flex items-center mb-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full text-white mr-2 ${getRarityColor(character.rarity)}`}
                >
                  {character.rarity}
                </span>
                <h3 className="text-base font-semibold text-white neon-text">{getTranslatedString(character.name)}</h3>
              </div>

              {/* Character action buttons */}
              <div className="character-action-button" style={{ bottom: "0.5rem", right: "0.5rem", top: "auto" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCharacterDetails(true)
                  }}
                  aria-label={getTranslatedString("character.details") || "Character details"}
                >
                  <Info className="w-4 h-4" />
                </button>
                {!isLeader && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSetLeader()
                    }}
                    aria-label={getTranslatedString("set_as_leader") || "Set as leader"}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveCharacter()
                  }}
                  className="text-red-400"
                  aria-label={getTranslatedString("remove_character") || "Remove character"}
                >
                  <X className="w-4 h-4" />
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
            ${
              !weaponEquipment
                ? "equipment-slot-empty neon-border"
                : getEquipmentQualityBgColor(weaponEquipment.quality)
            }
          `}
          onClick={() => handleEquipmentClick("weapon")}
        >
          {!weaponEquipment ? (
            <span className="text-xs text-[hsl(var(--neon-white))]">1</span>
          ) : (
            <div className="w-full h-full relative">
              <img
                src={weaponEquipment.url || `/placeholder.svg?height=100&width=100`}
                alt={getTranslatedString(weaponEquipment.name)}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute bottom-1 right-1 bg-black bg-opacity-70 rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.weapon)
                }}
              >
                <Info className="w-3 h-3 text-[hsl(var(--neon-white))]" />
              </button>
            </div>
          )}
        </div>

        {/* Armor Slot */}
        <div
          className={`
            w-full aspect-square rounded-lg overflow-hidden cursor-pointer
            ${isEmpty ? "opacity-50 pointer-events-none" : ""}
            ${!armorEquipment ? "equipment-slot-empty neon-border" : getEquipmentQualityBgColor(armorEquipment.quality)}
          `}
          onClick={() => handleEquipmentClick("armor")}
        >
          {!armorEquipment ? (
            <span className="text-xs text-[hsl(var(--neon-white))]">2</span>
          ) : (
            <div className="w-full h-full relative">
              <img
                src={armorEquipment.url || `/placeholder.svg?height=100&width=100`}
                alt={getTranslatedString(armorEquipment.name)}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute bottom-1 right-1 bg-black bg-opacity-70 rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.armor)
                }}
              >
                <Info className="w-3 h-3 text-[hsl(var(--neon-white))]" />
              </button>
            </div>
          )}
        </div>

        {/* Accessory Slot */}
        <div
          className={`
            w-full aspect-square rounded-lg overflow-hidden cursor-pointer
            ${isEmpty ? "opacity-50 pointer-events-none" : ""}
            ${
              !accessoryEquipment
                ? "equipment-slot-empty neon-border"
                : getEquipmentQualityBgColor(accessoryEquipment.quality)
            }
          `}
          onClick={() => handleEquipmentClick("accessory")}
        >
          {!accessoryEquipment ? (
            <span className="text-xs text-[hsl(var(--neon-white))]">3</span>
          ) : (
            <div className="w-full h-full relative">
              <img
                src={accessoryEquipment.url || `/placeholder.svg?height=100&width=100`}
                alt={getTranslatedString(accessoryEquipment.name)}
                className="w-full h-full object-cover"
              />
              <button
                className="absolute bottom-1 right-1 bg-black bg-opacity-70 rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.accessory)
                }}
              >
                <Info className="w-3 h-3 text-[hsl(var(--neon-white))]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showEquipmentSelector && (
        <EquipmentSearchModal
          isOpen={true}
          onClose={() => setShowEquipmentSelector(null)}
          title={
            <h3 className="text-lg font-bold neon-text">
              {getTranslatedString(`select_${showEquipmentSelector}`) ||
                `Select ${showEquipmentSelector.charAt(0).toUpperCase() + showEquipmentSelector.slice(1)}`}
            </h3>
          }
          searchControl={{
            searchTerm: "",
            onSearchChange: () => {},
            sortBy: "quality",
            onSortByChange: () => {},
            sortDirection: "desc",
            onSortDirectionChange: () => {},
            sortOptions: [
              { value: "quality", label: getTranslatedString("sort_by_quality") || "Sort by Quality" },
              { value: "name", label: getTranslatedString("sort_by_name") || "Sort by Name" },
            ],
            searchPlaceholder: getTranslatedString("search_equipment") || "Search equipment",
          }}
          equipments={
            data.equipments
              ? Object.values(data.equipments).filter((equip: Equipment) => equip.type === showEquipmentSelector)
              : []
          }
          onSelectEquipment={handleEquipItem}
          getTranslatedString={getTranslatedString}
          type={showEquipmentSelector}
          maxWidth="max-w-3xl"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setShowEquipmentSelector(null)}
                className="neon-button px-4 py-2 rounded-lg text-sm"
              >
                {getTranslatedString("close")}
              </button>
            </div>
          }
        />
      )}

      {/* 캐릭터 상세 정보 모달 */}
      {showCharacterDetails && character && (
        <CharacterDetailsModal
          isOpen={showCharacterDetails}
          onClose={() => setShowCharacterDetails(false)}
          character={character}
          getTranslatedString={getTranslatedString}
          getCardInfo={getCardInfo}
          getSkill={getSkill}
          data={data}
        />
      )}

      {/* 장비 상세 정보 모달 */}
      {showEquipmentDetails && (
        <EquipmentDetailsModal
          isOpen={!!showEquipmentDetails}
          onClose={() => setShowEquipmentDetails(null)}
          equipment={getEquipment(showEquipmentDetails)!}
          getTranslatedString={getTranslatedString}
        />
      )}
    </div>
  )
}

