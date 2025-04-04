"use client"

import { Plus, Info, Crown, Sword, Shield, Gem } from "lucide-react"
import { useState, useRef, useEffect } from "react"
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
  getSkill?: (skillId: number) => any
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
  equipments = [],
  data,
  hasAnyCharacter,
}: CharacterSlotProps) {
  const isEmpty = characterId === -1
  const [showEquipmentSelector, setShowEquipmentSelector] = useState<"weapon" | "armor" | "accessory" | null>(null)
  const [showCharacterDetails, setShowCharacterDetails] = useState(false)
  const [showEquipmentDetails, setShowEquipmentDetails] = useState<string | null>(null)
  const characterSlotRef = useRef<HTMLDivElement>(null)
  const [slotWidth, setSlotWidth] = useState(0)

  // 캐릭터 슬롯의 너비를 측정하여 버튼 크기를 동적으로 조정
  useEffect(() => {
    const updateSlotWidth = () => {
      if (characterSlotRef.current) {
        setSlotWidth(characterSlotRef.current.offsetWidth)
      }
    }

    // 초기 로드 시 및 창 크기 변경 시 너비 업데이트
    updateSlotWidth()
    window.addEventListener("resize", updateSlotWidth)

    return () => {
      window.removeEventListener("resize", updateSlotWidth)
    }
  }, [])

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

  // 캐릭터 등급에 따른 테두리 색상 및 그림자 효과 직접 설정
  const getRarityBorderStyle = (rarity: string) => {
    switch (rarity) {
      case "UR":
        return {
          borderColor: "#f97316", // orange-500
          boxShadow: "0 0 10px rgba(249, 115, 22, 0.7), 0 0 15px rgba(249, 115, 22, 0.4)",
        }
      case "SSR":
        return {
          borderColor: "#eab308", // yellow-500
          boxShadow: "0 0 10px rgba(234, 179, 8, 0.7), 0 0 15px rgba(234, 179, 8, 0.4)",
        }
      case "SR":
        return {
          borderColor: "#a855f7", // purple-500
          boxShadow: "0 0 10px rgba(168, 85, 247, 0.7), 0 0 15px rgba(168, 85, 247, 0.4)",
        }
      case "R":
        return {
          borderColor: "#3b82f6", // blue-500
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.7), 0 0 15px rgba(59, 130, 246, 0.4)",
        }
      default:
        return {
          borderColor: "rgba(255, 255, 255, 0.5)",
          boxShadow: "0 0 5px rgba(255, 255, 255, 0.3)",
        }
    }
  }

  // 캐릭터 슬롯 스타일 - 직접 인라인 스타일로 적용
  const characterSlotStyle =
    !isEmpty && character
      ? {
          border: "2px solid",
          ...getRarityBorderStyle(character.rarity),
        }
      : {}

  // 버튼 크기 계산 - 슬롯 너비의 25%
  const buttonSize = Math.max(slotWidth * 0.25, 20) // 최소 20px 보장

  // 왕관 아이콘 크기 계산 - 슬롯 너비의 33%
  const crownSize = Math.max(slotWidth * 0.33, 24) // 최소 24px 보장

  return (
    <div className="flex flex-col relative" ref={characterSlotRef}>
      {/* 기존 상단 왕관 아이콘 제거 */}
      {/* {!isEmpty && isLeader && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-30">
          <div 
            className="bg-red-600 rounded-full p-1 shadow-lg flex items-center justify-center"
            style={{ width: `${crownSize}px`, height: `${crownSize}px` }}
          >
            <Crown className="w-full h-full text-yellow-300" />
          </div>
        </div>
      )} */}
      {/* Character Card - 모바일에서도 적절한 크기로 표시되도록 수정 */}
      <div
        className={`
  relative w-full aspect-[3/4] rounded-lg overflow-hidden
  ${
    isEmpty
      ? "flex items-center justify-center cursor-pointer border border-[hsla(var(--neon-white),0.3)] bg-black bg-opacity-70 hover:bg-white hover:bg-opacity-10"
      : "cursor-pointer character-slot-filled hover:bg-white hover:bg-opacity-10"
  }
  transition-all duration-200
`}
        onClick={onAddCharacter}
        style={characterSlotStyle}
      >
        {isEmpty ? (
          <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-[hsl(var(--neon-white))]" />
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
            <div className="relative z-10 p-1 sm:p-3 flex flex-col h-full">
              {/* Character action buttons - 상단에 위치 */}
              <div className="flex justify-between w-full">
                {/* 리더 임명 버튼 또는 리더 왕관 뱃지 - 왼쪽 위 */}
                <div
                  style={{
                    width: `${buttonSize}px`,
                    height: `${buttonSize}px`,
                    minWidth: `${buttonSize}px`,
                    minHeight: `${buttonSize}px`,
                  }}
                >
                  {!isEmpty &&
                    (isLeader ? (
                      <div
                        className="bg-red-600 rounded-md flex items-center justify-center transition-all duration-300"
                        style={{
                          width: `${buttonSize}px`,
                          height: `${buttonSize}px`,
                          minWidth: `${buttonSize}px`,
                          minHeight: `${buttonSize}px`,
                          border: "1px solid #f59e0b",
                          boxShadow: "0 0 8px rgba(245, 158, 11, 0.6)",
                        }}
                      >
                        <Crown className="w-3/4 h-3/4 text-yellow-300" />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSetLeader()
                        }}
                        aria-label={getTranslatedString("set_as_leader") || "Set as leader"}
                        className="character-action-btn hover:bg-black hover:bg-opacity-80 transition-all duration-300"
                        style={{
                          width: `${buttonSize}px`,
                          height: `${buttonSize}px`,
                          minWidth: `${buttonSize}px`,
                          minHeight: `${buttonSize}px`,
                        }}
                      >
                        <Crown className="w-3/4 h-3/4" />
                      </button>
                    ))}
                </div>

                {/* 정보 버튼 - 오른쪽 위 */}
                {!isEmpty && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCharacterDetails(true)
                    }}
                    aria-label={getTranslatedString("character.details") || "Character details"}
                    className="character-action-btn"
                    style={{
                      width: `${buttonSize}px`,
                      height: `${buttonSize}px`,
                      minWidth: `${buttonSize}px`,
                      minHeight: `${buttonSize}px`,
                    }}
                  >
                    <Info className="w-3/4 h-3/4" />
                  </button>
                )}
              </div>

              {/* 이름을 하단으로 이동, 희귀도 뱃지 제거 */}
              <div className="mt-auto">
                <h3 className="lg:text-xl text-xs sm:text-base font-semibold text-white neon-text truncate">
                  {getTranslatedString(character.name)}
                </h3>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Equipment Slots - 모바일에서도 적절한 크기로 표시되도록 수정 */}
      <div className="mt-1 sm:mt-2 grid grid-cols-3 gap-0.5 sm:gap-1">
        {/* Weapon Slot - Sword 아이콘 사용 */}
        <div
          className={`
          w-full aspect-square rounded-lg overflow-hidden cursor-pointer relative flex items-center justify-center
          ${isEmpty ? "opacity-50 pointer-events-none" : ""}
          ${!weaponEquipment ? "equipment-slot-empty neon-border" : getEquipmentQualityBgColor(weaponEquipment.quality)}
        `}
          onClick={() => handleEquipmentClick("weapon")}
        >
          {!weaponEquipment ? (
            <Sword className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--neon-white))]" />
          ) : (
            <div className="w-full h-full relative">
              {weaponEquipment.url ? (
                <img
                  src={weaponEquipment.url || "/placeholder.svg"}
                  alt={getTranslatedString(weaponEquipment.name)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center")
                    const textElement = document.createElement("span")
                    textElement.className = "text-[0.6rem] sm:text-xs text-center"
                    textElement.textContent = getTranslatedString(weaponEquipment.name).substring(0, 2)
                    e.currentTarget.parentElement?.appendChild(textElement)
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-[0.6rem] sm:text-xs text-center">
                    {getTranslatedString(weaponEquipment.name).substring(0, 2)}
                  </span>
                </div>
              )}

              {/* 장비 이름 - 슬롯 내부 하단에 표시 (모바일에서는 숨김) */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-1 py-0.5 text-[0.5rem] sm:text-xs text-center truncate neon-text hidden sm:block">
                {getTranslatedString(weaponEquipment.name)}
              </div>

              {/* 장비 정보 버튼 - 슬롯 내부 오른쪽 상단에 표시 - 모바일에서도 잘 보이도록 수정 */}
              <button
                className="equipment-info-btn hidden sm:flex"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.weapon)
                }}
              >
                <Info className="w-2 h-2" />
              </button>
            </div>
          )}
        </div>

        {/* Armor Slot - Shield 아이콘 사용 */}
        <div
          className={`
          w-full aspect-square rounded-lg overflow-hidden cursor-pointer relative flex items-center justify-center
          ${isEmpty ? "opacity-50 pointer-events-none" : ""}
          ${!armorEquipment ? "equipment-slot-empty neon-border" : getEquipmentQualityBgColor(armorEquipment.quality)}
        `}
          onClick={() => handleEquipmentClick("armor")}
        >
          {!armorEquipment ? (
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--neon-white))]" />
          ) : (
            <div className="w-full h-full relative">
              {armorEquipment.url ? (
                <img
                  src={armorEquipment.url || "/placeholder.svg"}
                  alt={getTranslatedString(armorEquipment.name)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center")
                    const textElement = document.createElement("span")
                    textElement.className = "text-[0.6rem] sm:text-xs text-center"
                    textElement.textContent = getTranslatedString(armorEquipment.name).substring(0, 2)
                    e.currentTarget.parentElement?.appendChild(textElement)
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-[0.6rem] sm:text-xs text-center">
                    {getTranslatedString(armorEquipment.name).substring(0, 2)}
                  </span>
                </div>
              )}

              {/* 장비 이름 - 슬롯 내부 하단에 표시 (모바일에서는 숨김) */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-1 py-0.5 text-[0.5rem] sm:text-xs text-center truncate neon-text hidden sm:block">
                {getTranslatedString(armorEquipment.name)}
              </div>

              {/* 장비 정보 버튼 - 슬롯 내부 오른쪽 상단에 표시 - 모바일에서도 잘 보이도록 수정 */}
              <button
                className="equipment-info-btn hidden sm:flex"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.armor)
                }}
              >
                <Info className="w-2 h-2" />
              </button>
            </div>
          )}
        </div>

        {/* Accessory Slot - Gem 아이콘 사용 */}
        <div
          className={`
          w-full aspect-square rounded-lg overflow-hidden cursor-pointer relative flex items-center justify-center
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
            <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--neon-white))]" />
          ) : (
            <div className="w-full h-full relative">
              {accessoryEquipment.url ? (
                <img
                  src={accessoryEquipment.url || "/placeholder.svg"}
                  alt={getTranslatedString(accessoryEquipment.name)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center")
                    const textElement = document.createElement("span")
                    textElement.className = "text-[0.6rem] sm:text-xs text-center"
                    textElement.textContent = getTranslatedString(accessoryEquipment.name).substring(0, 2)
                    e.currentTarget.parentElement?.appendChild(textElement)
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-[0.6rem] sm:text-xs text-center">
                    {getTranslatedString(accessoryEquipment.name).substring(0, 2)}
                  </span>
                </div>
              )}

              {/* 장비 이름 - 슬롯 내부 하단에 표시 (모바일에서는 숨김) */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-1 py-0.5 text-[0.5rem] sm:text-xs text-center truncate neon-text hidden sm:block">
                {getTranslatedString(accessoryEquipment.name)}
              </div>

              {/* 장비 정보 버튼 - 슬롯 내부 오른쪽 상단에 표시 - 모바일에서도 잘 보이도록 수정 */}
              <button
                className="equipment-info-btn hidden sm:flex"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEquipmentDetails(equipment.accessory)
                }}
              >
                <Info className="w-2 h-2" />
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
          getSkill={getSkill}
        />
      )}
    </div>
  )
}

