"use client"
import type { Character, Card } from "../types"
import React from "react"
import { TabModal } from "./ui/modal/TabModal"

interface CharacterDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  getTranslatedString: (key: string) => string
  getCardInfo: (cardId: string) => { card: Card } | null
  getSkill?: (skillId: number) => any
  data?: any
  initialTab?: "info" | "talents" | "breakthroughs"
}

export function CharacterDetailsModal({
  isOpen,
  onClose,
  character,
  getTranslatedString,
  getCardInfo,
  getSkill,
  data,
  initialTab = "info",
}: CharacterDetailsModalProps) {
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

  // Format text with color tags and other HTML tags
  const formatColorText = (text: string) => {
    if (!text) return ""

    // Remove newlines or replace with spaces
    const textWithoutNewlines = text.replace(/\n/g, " ")

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = textWithoutNewlines
      .replace(/<color=#([A-Fa-f0-9]{6})>/g, '<span style="color: #$1">')
      .replace(/<\/color>/g, "</span>")

    // Convert the DOM structure back to React elements
    const convertNodeToReact = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const childElements = Array.from(element.childNodes).map((child, i) => convertNodeToReact(child, i))

        if (element.tagName === "SPAN") {
          return (
            <span key={index} style={{ color: element.style.color }}>
              {childElements}
            </span>
          )
        }

        if (element.tagName === "I") {
          return <i key={index}>{childElements}</i>
        }

        if (element.tagName === "B") {
          return <b key={index}>{childElements}</b>
        }

        return <React.Fragment key={index}>{childElements}</React.Fragment>
      }

      return null
    }

    return Array.from(tempDiv.childNodes).map((node, i) => convertNodeToReact(node, i))
  }

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      tabs={[
        {
          id: "info",
          label: getTranslatedString("character.info") || "Character & Skills",
          content: (
            <div className="flex flex-col md:flex-row gap-4 p-4">
              {/* Character Image and Description */}
              <div className="w-full md:w-1/3">
                <div className="aspect-[3/4] max-w-[200px] mx-auto md:max-w-none bg-black rounded-lg overflow-hidden neon-border">
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
                    <span className="neon-text">{getTranslatedString(character.name)}</span>
                  </div>
                </div>

                {/* Character Description moved below portrait - 포맷팅 적용 */}
                <div className="mt-4 character-detail-section">
                  <h3 className="character-detail-section-title">
                    {getTranslatedString("character.description") || "Description"}
                  </h3>
                  <p className="text-gray-300">{formatColorText(getTranslatedString(character.desc))}</p>
                </div>
              </div>

              {/* Character Skills */}
              <div className="w-full md:w-2/3">
                <div className="character-detail-section">
                  <h3 className="character-detail-section-title">
                    {getTranslatedString("character.skills") || "Skills"}
                  </h3>
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
          ),
        },
        {
          id: "talents",
          label: getTranslatedString("character.talents") || "Talents",
          content: (
            <div className="space-y-3 p-4">
              {character.talentList && character.talentList.length > 0 ? (
                character.talentList.map((talent, index) => (
                  <div key={`talent-${index}`} className="p-3 bg-black bg-opacity-50 rounded-lg">
                    <div className="flex">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium neon-text">
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
          ),
        },
        {
          id: "breakthroughs",
          label: getTranslatedString("character.breakthroughs") || "Breakthroughs",
          content: (
            <div className="space-y-3 p-4">
              {character.breakthroughList && character.breakthroughList.length > 0 ? (
                // 첫 번째 항목을 제외하고 표시
                character.breakthroughList
                  .slice(1)
                  .map((breakthrough, index) => (
                    <div key={`breakthrough-${index}`} className="p-3 bg-black bg-opacity-50 rounded-lg">
                      <div className="flex">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium neon-text">
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
          ),
        },
      ]}
      initialTabId={initialTab}
      footer={
        <div className="flex justify-end">
          <button onClick={onClose} className="neon-button px-4 py-2 rounded-lg text-sm">
            Close
          </button>
        </div>
      }
      maxWidth="max-w-2xl"
    />
  )

  // Helper function to render a skill
  function renderSkill(index: number, labelKey: string, defaultLabel: string) {
    if (!character.skillList || character.skillList.length <= index) {
      return (
        <div className="p-3 rounded-lg opacity-50">
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
        <div className="p-3 rounded-lg opacity-50">
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
      <div className="p-3 rounded-lg">
        <div className="flex">
          {/* Skill Image */}
          <div className="w-12 h-12 bg-black rounded-md overflow-hidden mr-3 flex-shrink-0">
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
              <span className="font-medium neon-text">{getTranslatedString(skill.name)}</span>
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

