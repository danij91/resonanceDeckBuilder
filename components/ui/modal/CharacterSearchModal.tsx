"use client"
import { SearchModal, type SearchModalProps } from "./SearchModal"
import type { Character } from "../../../types"
import { Info } from "lucide-react"
import { useState } from "react"
import { CharacterDetailsModal } from "../../../components/character-details-modal"

export interface CharacterSearchModalProps extends Omit<SearchModalProps, "children" | "searchControl"> {
  characters: Character[]
  onSelectCharacter: (characterId: number) => void
  getTranslatedString: (key: string) => string
  getCardInfo?: (cardId: string) => { card: any } | null
  getSkill?: (skillId: number) => any
  data?: any
  searchTerm?: string
  onSearchChange?: (value: string) => void
  sortBy?: string
  onSortByChange?: (value: string) => void
  sortDirection?: "asc" | "desc"
  onSortDirectionChange?: () => void
  sortOptions?: { value: string; label: string }[]
  searchPlaceholder?: string
}

export function CharacterSearchModal({
  characters,
  onSelectCharacter,
  getTranslatedString,
  getCardInfo,
  getSkill,
  data,
  searchTerm = "",
  onSearchChange = () => {},
  sortBy = "rarity",
  onSortByChange = () => {},
  sortDirection = "desc",
  onSortDirectionChange = () => {},
  sortOptions = [],
  searchPlaceholder,
  ...searchModalProps
}: CharacterSearchModalProps) {
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

  // CharacterSearchModal 컴포넌트 내부에 상태 추가
  const [showCharacterDetails, setShowCharacterDetails] = useState<number | null>(null)

  return (
    <>
      <SearchModal
        {...searchModalProps}
        searchControl={{
          searchTerm,
          onSearchChange,
          sortBy,
          onSortByChange,
          sortDirection,
          onSortDirectionChange,
          sortOptions,
          searchPlaceholder,
        }}
        closeOnOutsideClick={true}
      >
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {/* 없음 옵션 추가 */}
            <div onClick={() => onSelectCharacter(-1)} className="cursor-pointer">
              <div className="relative w-full aspect-[3/4] rounded-lg border-2 border-gray-700 overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg bg-black bg-opacity-70">
                <div className="flex items-center justify-center h-full">
                  <span className="text-lg font-bold text-white neon-text">
                    {getTranslatedString("none") || "None"}
                  </span>
                </div>
              </div>
            </div>

            {characters.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-400">
                {getTranslatedString("no_characters_found") || "No characters found"}
              </div>
            ) : (
              characters.map((character) => (
                <div key={character.id} className="cursor-pointer relative">
                  <div
                    className={`relative w-full aspect-[3/4] rounded-lg border-2 ${getRarityBorderColor(character.rarity)} overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                    style={{
                      boxShadow:
                        character.rarity === "UR"
                          ? "0 0 10px rgba(255, 165, 0, 0.7)"
                          : character.rarity === "SSR"
                            ? "0 0 10px rgba(255, 215, 0, 0.7)"
                            : character.rarity === "SR"
                              ? "0 0 10px rgba(147, 112, 219, 0.7)"
                              : "0 0 10px rgba(100, 149, 237, 0.7)",
                    }}
                    onClick={() => onSelectCharacter(character.id)}
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
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                    {/* Content */}
                    <div className="relative z-10 p-1 sm:p-3 flex flex-col h-full">
                      {/* Name */}
                      <h3 className="text-xs sm:text-base font-semibold text-white neon-text truncate">
                        {getTranslatedString(character.name)}
                      </h3>

                      {/* Rarity badge */}
                      <div
                        className="absolute bottom-1 right-1 bg-black bg-opacity-70 px-1 py-0.5 rounded text-xs font-bold"
                        style={{
                          color:
                            character.rarity === "UR"
                              ? "#FFA500"
                              : character.rarity === "SSR"
                                ? "#FFD700"
                                : character.rarity === "SR"
                                  ? "#9370DB"
                                  : character.rarity === "R"
                                    ? "#6495ED"
                                    : "#86878c",
                        }}
                      >
                        {character.rarity}
                      </div>
                    </div>
                  </div>

                  <button
                      className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-0.5 sm:p-1 flex items-center justify-center z-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setShowCharacterDetails(character.id)
                        console.log("Character info button clicked", character.id)
                      }}
                    >
                      <Info className="w-7 h-7 text-white" />
                    </button>
                </div>
              ))
            )}
          </div>
        </div>
      </SearchModal>

      {/* 캐릭터 상세 정보 모달 */}
      {showCharacterDetails !== null && (
        <CharacterDetailsModal
          isOpen={showCharacterDetails !== null}
          onClose={() => setShowCharacterDetails(null)}
          character={characters.find((c) => c.id === showCharacterDetails)!}
          getTranslatedString={getTranslatedString}
          getCardInfo={getCardInfo || (() => null)}
          getSkill={getSkill}
          data={data}
        />
      )}
    </>
  )
}
