"use client"
import { SearchModal, type SearchModalProps } from "./SearchModal"
import type { Character } from "../../../types"

export interface CharacterSearchModalProps extends Omit<SearchModalProps, "children"> {
  characters: Character[]
  onSelectCharacter: (characterId: number) => void
  getTranslatedString: (key: string) => string
}

export function CharacterSearchModal({
  characters,
  onSelectCharacter,
  getTranslatedString,
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
  return (
    <SearchModal {...searchModalProps}>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {characters.length === 0 ? (
            <div className="col-span-full text-center py-4 text-gray-400">
              {getTranslatedString("no_characters_found") || "No characters found"}
            </div>
          ) : (
            characters.map((character) => (
              <div key={character.id} onClick={() => onSelectCharacter(character.id)} className="cursor-pointer">
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
                  <div className="relative z-10 p-3 flex flex-col h-full">
                    {/* Name */}
                    <h3 className="text-base font-semibold text-white neon-text">
                      {getTranslatedString(character.name)}
                    </h3>

                    {/* Rarity badge */}
                    <div
                      className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs font-bold"
                      style={{
                        color:
                          character.rarity === "UR"
                            ? "#FFA500"
                            : character.rarity === "SSR"
                              ? "#FFD700"
                              : character.rarity === "SR"
                                ? "#9370DB"
                                : "#6495ED",
                      }}
                    >
                      {character.rarity}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SearchModal>
  )
}

