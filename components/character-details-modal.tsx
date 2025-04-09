"use client"
import type { Character, Card } from "../types"
import type React from "react"
import { useState, useEffect } from "react"
import { TabModal } from "./ui/modal/TabModal"
import { formatColorText } from "../utils/format-text"

interface CharacterDetailsModalProps {
  isOpen: boolean
  onClose: (e?: React.MouseEvent) => void
  character: Character
  getTranslatedString: (key: string) => string
  getCardInfo: (cardId: string) => { card: Card } | null
  getSkill?: (skillId: number) => any
  data?: any
  initialTab?: "info" | "talents" | "breakthroughs"
  selectedAwakeningStage?: number | null
  onAwakeningSelect?: (stage: number | null) => void
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
  selectedAwakeningStage = null,
  onAwakeningSelect,
}: CharacterDetailsModalProps) {
  // 홈 스킬 데이터를 저장할 상태 추가
  const [homeSkills, setHomeSkills] = useState<any[]>([])

  // 컴포넌트 마운트 시 홈 스킬 데이터 로드
  useEffect(() => {
    // 캐릭터에 homeSkillList가 있는 경우에만 처리
    if (character && character.homeSkillList && data) {
      const loadHomeSkills = async () => {
        try {
          // home_skill_db.json 데이터 로드 (이미 data에 있다면 그것을 사용)
          let homeSkillDb = data.homeSkills

          // data에 homeSkills가 없다면 API로 가져오기 시도
          if (!homeSkillDb) {
            try {
              const response = await fetch("/api/db/home_skill_db.json")
              homeSkillDb = await response.json()
            } catch (error) {
              console.error("Failed to load home skill data:", error)
              return
            }
          }

          // homeSkillType별로 param 값을 누적하기 위한 맵
          const accumulatedParams: Record<string, number> = {}

          // 캐릭터의 homeSkillList에서 정보 추출
          const skills = character.homeSkillList
            .map((homeSkill: any) => {
              const skillData = homeSkillDb[homeSkill.id]
              if (!skillData) return null

              // param 값이 있으면 저장
              const paramValue = homeSkill.param || skillData?.param || 0

              // homeSkillType이 있으면 누적 값 계산
              const homeSkillType = skillData.homeSkillType || homeSkill.homeSkillType || homeSkill.id

              // 이전에 같은 타입이 있었다면 누적
              if (accumulatedParams[homeSkillType] !== undefined) {
                accumulatedParams[homeSkillType] += paramValue
              } else {
                accumulatedParams[homeSkillType] = paramValue
              }

              return {
                ...homeSkill,
                ...skillData,
                paramValue,
                homeSkillType,
                accumulatedValue: accumulatedParams[homeSkillType],
              }
            })
            .filter(Boolean)

          setHomeSkills(skills)
        } catch (error) {
          console.error("Error processing home skills:", error)
        }
      }

      loadHomeSkills()
    }
  }, [character, data])

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

  // Process skill description to replace #r with actual values
  const processSkillDescription = (skill: any, description: string) => {
    if (!skill || !description) return description

    // 번역된 설명 가져오기
    const translatedDesc = getTranslatedString(description)

    // Check if desParamList exists and has items
    if (skill.desParamList && skill.desParamList.length > 0) {
      // 모든 #r 태그를 찾아서 배열로 저장
      const rTags = translatedDesc.match(/#r/g) || []

      // #r 태그가 없으면 원본 반환
      if (rTags.length === 0) return translatedDesc

      let processedDesc = translatedDesc
      let rTagIndex = 0

      // desParamList의 각 항목을 순회하면서 #r 태그를 순서대로 대체
      for (let i = 0; i < skill.desParamList.length && rTagIndex < rTags.length; i++) {
        const param = skill.desParamList[i]
        const paramValue = param.param

        // Check if skillParamList exists
        if (skill.skillParamList && skill.skillParamList[0]) {
          // Find the skillRate key based on param value
          const rateKey = `skillRate${paramValue}_SN`
          if (skill.skillParamList[0][rateKey] !== undefined) {
            // Calculate the rate value (divide by 10000)
            let rateValue = Math.floor(skill.skillParamList[0][rateKey] / 10000)

            // Add % if isPercent is true
            if (param.isPercent) {
              rateValue = `${rateValue}%`
            }

            // Replace only the first occurrence of #r
            processedDesc = processedDesc.replace(/#r/, rateValue.toString())
            rTagIndex++
          }
        }
      }

      return processedDesc
    }

    return translatedDesc
  }

  // Process homeSkill description to replace %s with param value
  const processHomeSkillDesc = (desc: string, paramValue: number) => {
    if (!desc) return desc

    // %s% 패턴을 찾아 100을 곱한 값으로 교체 (예: 0.2 -> 20%)
    let processedDesc = desc.replace(/%s%/g, () => {
      const percentValue = Math.round(paramValue * 100)
      return `${percentValue}`
    })

    // 일반 %s 패턴을 찾아 값으로 교체
    processedDesc = processedDesc.replace(/%s/g, paramValue.toString())

    return processedDesc
  }

  // Format text with color tags and other HTML tags

  // 각성 항목 선택 핸들러
  const handleAwakeningSelect = (stage: number) => {
    if (onAwakeningSelect) {
      // 이미 선택된 항목을 다시 클릭하면 선택 취소
      if (selectedAwakeningStage === stage) {
        onAwakeningSelect(null)
      } else {
        onAwakeningSelect(stage)
      }
    }
  }

  // 이미지 URL 가져오기 함수
  const getImageUrl = (type: "talent" | "break", id: number) => {
    if (!data || !data.images) return null

    const imageKey = `${type}_${id}`
    return data.images[imageKey] || null
  }

  const modalProps = {
    isOpen: isOpen,
    onClose: (e) => onClose(e),
    tabs: [
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
              character.talentList.map((talent, index) => {
                // 공명 이미지 URL 가져오기
                const talentImageUrl = getImageUrl("talent", talent.talentId)

                // 해당 공명 단계에 맞는 홈 스킬 찾기
                const relatedHomeSkills = homeSkills.filter((skill) => skill.resonanceLv === index + 1)

                return (
                  <div key={`talent-${index}`} className="p-3 bg-black bg-opacity-50 rounded-lg">
                    <div className="flex">
                      {/* 공명 이미지 또는 번호 표시 */}
                      <div className="w-12 h-12 flex-shrink-0 mr-3 rounded-md overflow-hidden flex items-center justify-center">
                        {talentImageUrl ? (
                          <img
                            src={talentImageUrl || "/placeholder.svg"}
                            alt={`Talent ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center">
                          <div className="font-medium neon-text">
                            {data?.talents && data.talents[talent.talentId]
                              ? getTranslatedString(data.talents[talent.talentId].name)
                              : `Talent ${talent.talentId}`}
                          </div>
                          {/* 공명 단계 표시 */}
                          <div className="ml-2 text-xs px-2 py-0.5 bg-gray-600 rounded-full text-white">
                            {"Lv."} {index + 1}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {formatColorText(
                            data?.talents && data.talents[talent.talentId]
                              ? getTranslatedString(data.talents[talent.talentId].desc)
                              : "No description available",
                          )}
                        </div>

                        {/* 관련 홈 스킬 표시 */}
                        {relatedHomeSkills.length > 0 && (
                          <div className="mt-2 border-t border-gray-700 pt-2">
                            {relatedHomeSkills.map((skill, skillIndex) => (
                              <div key={`home-skill-${skillIndex}`} className="text-xs text-gray-300 ml-2 mb-1">
                                <span className="font-medium text-white">
                                  {getTranslatedString(skill.name) || skill.name}:
                                </span>{" "}
                                {formatColorText(
                                  processHomeSkillDesc(
                                    getTranslatedString(skill.desc) || skill.desc,
                                    skill.accumulatedValue || skill.paramValue,
                                  ),
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
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
              // 각성 항목 선택 가능하도록 수정
              character.breakthroughList
                .slice(1)
                .map((breakthrough, index) => {
                  // 각성 이미지 URL 가져오기
                  const breakImageUrl = getImageUrl("break", breakthrough.breakthroughId)

                  return (
                    <div
                      key={`breakthrough-${index}`}
                      className={`p-3 bg-black bg-opacity-50 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedAwakeningStage !== null && index + 1 <= selectedAwakeningStage
                          ? "border-2 border-blue-500 shadow-lg shadow-blue-500/50"
                          : "hover:bg-black hover:bg-opacity-70"
                      }`}
                      onClick={() => handleAwakeningSelect(index + 1)}
                    >
                      <div className="flex">
                        {/* 각성 이미지 또는 번호 표시 */}
                        <div
                          className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center mr-3 overflow-hidden ${
                            selectedAwakeningStage !== null && index + 1 <= selectedAwakeningStage
                              ? "bg-purple-600"
                              : ""
                          }`}
                        >
                          {breakImageUrl ? (
                            <img
                              src={breakImageUrl || "/placeholder.svg"}
                              alt={`Breakthrough ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center">
                            <div className="font-medium neon-text">
                              {data?.breakthroughs && data.breakthroughs[breakthrough.breakthroughId]
                                ? getTranslatedString(data.breakthroughs[breakthrough.breakthroughId].name)
                                : `Breakthrough ${breakthrough.breakthroughId}`}
                            </div>
                            {/* 각성 단계 표시 */}
                            <div className="ml-2 text-xs px-2 py-0.5 bg-gray-600 rounded-full text-white">
                              {"Lv."} {index + 1}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {formatColorText(
                              data?.breakthroughs && data.breakthroughs[breakthrough.breakthroughId]
                                ? getTranslatedString(data.breakthroughs[breakthrough.breakthroughId].desc)
                                : "No description available",
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
            ) : (
              <div className="text-gray-400 text-center p-4">
                {getTranslatedString("no_breakthroughs") || "No breakthroughs available"}
              </div>
            )}
          </div>
        ),
      },
    ],
  }

  return (
    <TabModal
      {...modalProps}
      initialTabId={initialTab}
      footer={
        <div className="flex justify-end">
          <button onClick={() => onClose()} className="neon-button px-4 py-2 rounded-lg text-sm">
            Close
          </button>
        </div>
      }
      maxWidth="max-w-2xl"
      closeOnOutsideClick={true} // 외부 클릭으로 닫히지 않도록 설정
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
    const skillQuantity = skillItem.num || 0

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

    // Get skill cost from card data if available
    let skillCost = 0
    if (skill.cardID) {
      const cardData = data?.cards[skill.cardID]
      if (cardData && cardData.cost_SN !== undefined) {
        skillCost = Math.floor(cardData.cost_SN / 10000)
      }
    }

    // Process skill description with #r replacement
    const processedDescription = processSkillDescription(skill, getTranslatedString(skill.description))

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

              {/* Add cost and quantity information */}
              <span className="ml-2 text-sm text-gray-300">
                COST : {skillCost} / {getTranslatedString("amount")} : {skillQuantity}
              </span>
            </div>

            {processedDescription && (
              <div className="text-sm text-gray-400 mt-1">{formatColorText(processedDescription)}</div>
            )}

            {/* 필살기(인덱스 2)일 경우 리더 스킬 조건 표시 */}
            {index === 2 && skill.leaderCardConditionDesc && (
              <div className="text-sm mt-2" style={{ color: "#800020" }}>
                <strong>{getTranslatedString("leader_skill_condition")}: </strong>
                {formatColorText(getTranslatedString(skill.leaderCardConditionDesc))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
