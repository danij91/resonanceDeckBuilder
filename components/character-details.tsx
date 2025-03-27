"use client"

import { useState } from "react"
import type { Character, Card, CardExtraInfo } from "../types"

interface CharacterDetailsProps {
  character: Character
  getTranslatedString: (key: string) => string
  onClose: () => void
  getCardInfo: (cardId: string) => { card: Card; cardExtraInfo: CardExtraInfo } | null
}

export function CharacterDetails({ character, getTranslatedString, onClose, getCardInfo }: CharacterDetailsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "awakening">("info")

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[90vh]">
        {/* Tabs - Each tab takes 50% width */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-3 text-sm font-medium w-1/2 text-center ${
              activeTab === "info" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("info")}
          >
            {getTranslatedString("character.info") || "Basic Info"}
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium w-1/2 text-center ${
              activeTab === "awakening"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("awakening")}
          >
            {getTranslatedString("character.awakening.resonance") || "Awakening & Resonance"}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-grow min-h-[400px]">
          {activeTab === "info" ? (
            <div className="flex flex-col md:flex-row gap-4">
              {/* Character Image */}
              <div className="w-full md:w-1/3">
                <div className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
                  {character.img_card && (
                    <img
                      src={character.img_card || "/placeholder.svg"}
                      alt={getTranslatedString(character.name)}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-lg font-bold flex items-center justify-center">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full text-white mr-2 ${getRarityColor(character.rarity)}`}
                    >
                      {character.rarity}
                    </span>
                    {getTranslatedString(character.name)}
                  </div>
                </div>
              </div>

              {/* Character Info */}
              <div className="w-full md:w-2/3">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    {getTranslatedString("character.description") || "Description"}
                  </h3>
                  <p className="text-gray-300">{getTranslatedString(character.desc)}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">{getTranslatedString("character.skills") || "Skills"}</h3>
                  <div className="space-y-4">
                    {character.skills &&
                      Object.entries(character.skills).map(([index, cardId]) => {
                        const cardInfo = getCardInfo(cardId)
                        if (!cardInfo) return null

                        const { card, extraInfo } = cardInfo
                        const skillType =
                          Number.parseInt(index) === 3
                            ? getTranslatedString("skill.ultimate") || "Ultimate"
                            : `${getTranslatedString("skill.normal") || "Skill"} ${index}`

                        return (
                          <div key={cardId} className="p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                              {/* Skill Image - 20% larger */}
                              <div className="w-14 h-14 bg-gray-600 rounded-md mr-3 flex-shrink-0 overflow-hidden">
                                {extraInfo.img_url && (
                                  <img
                                    src={extraInfo.img_url || "/placeholder.svg"}
                                    alt={getTranslatedString(extraInfo.name)}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center">
                                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full mr-2">
                                    {skillType}
                                  </span>
                                  <span className="font-medium">{getTranslatedString(extraInfo.name)}</span>
                                </div>
                                <div className="text-sm text-gray-300 mt-1">{getTranslatedString(extraInfo.desc)}</div>
                                <div className="flex text-xs mt-1 text-gray-400">
                                  <span className="mr-2">
                                    {getTranslatedString("cost") || "Cost"}: {extraInfo.cost}
                                  </span>
                                  <span>
                                    {getTranslatedString("amount") || "Amount"}: {extraInfo.amount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Awakening */}
              <div>
                <h3 className="text-lg font-medium mb-3">
                  {getTranslatedString("character.awakening") || "Awakening"}
                </h3>
                <div className="space-y-3">
                  {character.awakening.map((awake, index) => (
                    <div key={index} className="p-3 bg-gray-700 rounded-lg">
                      <div className="font-medium">{getTranslatedString(awake.name)}</div>
                      <div className="text-sm text-gray-300 mt-1">{getTranslatedString(awake.desc)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resonance */}
              <div>
                <h3 className="text-lg font-medium mb-3">
                  {getTranslatedString("character.resonance") || "Resonance"}
                </h3>
                <div className="space-y-3">
                  {character.resonance.map((reson, index) => (
                    <div key={index} className="p-3 bg-gray-700 rounded-lg">
                      <div className="font-medium">{getTranslatedString(reson.name)}</div>
                      <div className="text-sm text-gray-300 mt-1">{getTranslatedString(reson.desc)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
            {getTranslatedString("close") || "Close"}
          </button>
        </div>
      </div>
    </div>
  )
}

