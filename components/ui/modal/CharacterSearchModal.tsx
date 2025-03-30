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
      <div className="flex-grow overflow-y-auto p-4" style={{ backgroundColor: "var(--modal-content-bg)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {characters.length === 0 ? (
            <div className="col-span-full text-center py-4 text-gray-400">
              {getTranslatedString("no_characters_found") || "No characters found"}
            </div>
          ) : (
            characters.map((character) => (
              <div key={character.id} onClick={() => onSelectCharacter(character.id)} className="cursor-pointer">
                <div
                  className={`relative w-full aspect-[3/4] rounded-lg border-2 ${getRarityBorderColor(character.rarity)} overflow-hidden hover:opacity-80 neon-border`}
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

