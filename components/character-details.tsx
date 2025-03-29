"use client"

import { useState } from "react"
import type { Character, Card } from "../types"
import React from "react"

// data 매개변수 추가
interface CharacterDetailsProps {
  character: Character
  getTranslatedString: (key: string) => string
  onClose: () => void
  getCardInfo: (cardId: string) => { card: Card } | null
  getSkill?: (skillId: number) => any
  data?: any // 데이터 객체 추가
}

export function CharacterDetails({
  character,
  getTranslatedString,
  onClose,
  getCardInfo,
  getSkill,
  data, // 데이터 매개변수 추가
}: CharacterDetailsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "talents">("info")

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

  // Function to format text with color tags
  const formatColorText = (text: string) => {
    if (!text) return ""

    // Replace <color=#XXXXXX>text</color> with styled spans
    const formattedText = text.split(/(<color=#[A-Fa-f0-9]{6}>.*?<\/color>)/).map((part, index) => {
      const colorMatch = part.match(/<color=#([A-Fa-f0-9]{6})>(.*?)<\/color>/)
      if (colorMatch) {
        const [_, colorCode, content] = colorMatch
        return (
          <span key={index} style={{ color: `#${colorCode}` }}>
            {content}
          </span>
        )
      }

      // Handle newlines by replacing \n with <br />
      return part.split("\\n").map((line, i) =>
        i === 0 ? (
          line
        ) : (
          <React.Fragment key={`line-${index}-${i}`}>
            <br />
            {line}
          </React.Fragment>
        ),
      )
    })

    return formattedText
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs - Each tab takes 50% width */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-3 text-sm font-medium w-1/2 text-center ${
              activeTab === "info" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("info")}
          >
            {getTranslatedString("character.info") || "Character & Skills"}
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium w-1/2 text-center ${
              activeTab === "talents" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("talents")}
          >
            {getTranslatedString("character.talents_break") || "Talents & Breakthroughs"}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-grow min-h-[400px]">
          {activeTab === "info" ? (
            <div className="flex flex-col md:flex-row gap-4">
              {/* Character Image and Description */}
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

                {/* Character Description moved below portrait */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">
                    {getTranslatedString("character.description") || "Description"}
                  </h3>
                  <p className="text-gray-300">{getTranslatedString(character.desc)}</p>
                </div>
              </div>

              {/* Character Skills */}
              <div className="w-full md:w-2/3">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{getTranslatedString("character.skills") || "Skills"}</h3>
                  <div className="space-y-3">
                    {/* Skill 1 */}
                    {renderSkill(0, "skill.normal_1", "Skill 1")}

                    {/* Skill 2 */}
                    {renderSkill(1, "skill.normal_2", "Skill 2")}

                    {/* Ultimate Skill */}
                    {renderSkill(2, "skill.ultimate", "Ultimate")}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Talents Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">{getTranslatedString("character.talents") || "Talents"}</h3>
                <div className="space-y-3">
                  {character.talentList && character.talentList.length > 0 ? (
                    character.talentList.map((talent, index) => (
                      <div key={`talent-${index}`} className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium">
                              {getTranslatedString(`talent_name_${talent.talentId}`) || `Talent ${talent.talentId}`}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {formatColorText(
                                getTranslatedString(`talent_desc_${talent.talentId}`) || "No description available",
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      {getTranslatedString("no_talents") || "No talents available"}
                    </div>
                  )}
                </div>
              </div>

              {/* Breakthroughs Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">
                  {getTranslatedString("character.breakthroughs") || "Breakthroughs"}
                </h3>
                <div className="space-y-3">
                  {character.breakthroughList && character.breakthroughList.length > 0 ? (
                    // 첫 번째 항목을 제외하고 표시
                    character.breakthroughList
                      .slice(1)
                      .map((breakthrough, index) => (
                        <div key={`breakthrough-${index}`} className="p-3 bg-gray-700 rounded-lg">
                          <div className="flex">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-grow">
                              <div className="font-medium">
                                {getTranslatedString(`break_name_${breakthrough.breakthroughId}`) ||
                                  `Breakthrough ${breakthrough.breakthroughId}`}
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                {formatColorText(
                                  getTranslatedString(`break_desc_${breakthrough.breakthroughId}`) ||
                                    "No description available",
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      {getTranslatedString("no_breakthroughs") || "No breakthroughs available"}
                    </div>
                  )}
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

  // Helper function to render a skill
  function renderSkill(index: number, labelKey: string, defaultLabel: string) {
    if (!character.skillList || character.skillList.length <= index) {
      return (
        <div className="p-3 bg-gray-700 rounded-lg opacity-50">
          <div className="flex items-center">
            <div>
              <div className="flex items-center">
                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full mr-2">
                  {getTranslatedString(labelKey) || defaultLabel}
                </span>
                <span className="font-medium">{getTranslatedString("skill.not_available") || "Not Available"}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const skillItem = character.skillList[index]
    const skillId = skillItem.skillId

    // 스킬 정보 직접 가져오기
    const skill = getSkill ? getSkill(skillId) : null

    if (!skill) {
      return (
        <div className="p-3 bg-gray-700 rounded-lg opacity-50">
          <div className="flex items-center">
            <div>
              <div className="flex items-center">
                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full mr-2">
                  {getTranslatedString(labelKey) || defaultLabel}
                </span>
                <span className="font-medium">{getTranslatedString("skill.not_found") || `Skill ID: ${skillId}`}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // 스킬 이미지 URL 찾기
    let skillImageUrl = null
    if (data && data.images) {
      // 스킬 ID로 이미지 찾기
      if (data.images[`skill_${skillId}`]) {
        skillImageUrl = data.images[`skill_${skillId}`]
      }
      // 카드 ID로 이미지 찾기
      else if (skill.cardID && data.images[`card_${skill.cardID}`]) {
        skillImageUrl = data.images[`card_${skill.cardID}`]
      }
    }

    return (
      <div className="p-3 bg-gray-700 rounded-lg">
        <div className="flex">
          {/* Skill Image */}
          <div className="w-12 h-12 bg-gray-600 rounded-md overflow-hidden mr-3 flex-shrink-0">
            {skillImageUrl ? (
              <img src={skillImageUrl || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xs">No Image</span>
              </div>
            )}
          </div>

          <div className="flex-grow">
            <div className="flex items-center">
              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full mr-2">
                {getTranslatedString(labelKey) || defaultLabel}
              </span>
              <span className="font-medium">{getTranslatedString(skill.name)}</span>
            </div>
            {skill.description && (
              <div className="text-sm text-gray-400 mt-1">
                {formatColorText(getTranslatedString(skill.description))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

