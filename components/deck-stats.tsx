"use client"

import { useState, useMemo, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import type { Card, CardExtraInfo } from "../types"

interface DeckStatsProps {
  selectedCards: {
    id: string
    useType: number
    useParam: number
    useParamMap?: Record<string, number>
    skillId?: number
  }[]
  availableCards: { card: Card; extraInfo: CardExtraInfo; characterImage?: string }[]
  getTranslatedString: (key: string) => string
  data: any
}

export function DeckStats({ selectedCards, availableCards, getTranslatedString, data }: DeckStatsProps) {
  const [includeDerivedCards, setIncludeDerivedCards] = useState(true)
  const [tagData, setTagData] = useState<Record<string, any>>({})

  // Load tag data와 tag color mapping data
  useEffect(() => {
    const loadData = async () => {
      try {
        // 태그 데이터 로드
        const tagResponse = await fetch("/api/db/tag_db.json")
        const tagData = await tagResponse.json()
        setTagData(tagData)

        // 태그 색상 매핑 데이터 로드
        const tagColorResponse = await fetch("/api/db/tag_color_mapping.json")
        const tagColorData = await tagColorResponse.json()
        setTagColorMapping(tagColorData)
      } catch (error) {
        console.error("Failed to load tag data:", error)
      }
    }

    loadData()
  }, [])

  // 태그 색상 매핑 상태 추가
  const [tagColorMapping, setTagColorMapping] = useState<Record<string, string[]>>({})

  // Get the cards that are actually in the deck (not disabled)
  const activeCards = useMemo(() => {
    return selectedCards
      .filter((card) => card.useType !== 2) // Filter out disabled cards
      .map((selectedCard) => {
        const cardInfo = availableCards.find((c) => c.card.id.toString() === selectedCard.id)
        return cardInfo ? { ...cardInfo, selectedCard } : null
      })
      .filter(Boolean) as {
      card: Card
      extraInfo: CardExtraInfo
      characterImage?: string
      selectedCard: any
    }[]
  }, [selectedCards, availableCards])

  // Filter cards based on includeDerivedCards toggle
  const filteredCards = useMemo(() => {
    if (!data || !includeDerivedCards) {
      // If no data or derived cards should be excluded, filter based on char_skill_map
      return activeCards.filter((cardInfo) => {
        // If no skillId, we can't determine if it's derived, so include it
        if (!cardInfo.selectedCard.skillId) return true

        // Check all characters in char_skill_map
        for (const charId in data.charSkillMap) {
          const charSkillMap = data.charSkillMap[charId]

          // If the skill is in the skills array, it's not derived
          if (charSkillMap.skills && charSkillMap.skills.includes(cardInfo.selectedCard.skillId)) {
            return true
          }
        }

        // If not found in any character's skills array, it's derived
        return false
      })
    }

    // Include all cards
    return activeCards
  }, [activeCards, includeDerivedCards, data])

  // 색상 순서 배열 추가
  const colorOrder = ["Red", "Green", "Blue", "Yellow", "Purple", "Unknown"]

  // Color mapping for the chart
  const colorMap: Record<string, string> = {
    Red: "#ef4444",
    Blue: "#3b82f6",
    Yellow: "#eab308",
    Green: "#22c55e",
    Purple: "#a855f7",
    Unknown: "#6b7280",
  }

  // Get color distribution with quantities
  const colorDistribution = useMemo(() => {
    const colors: Record<
      string,
      { count: number; cards: { name: string; quantity: number; characterName?: string }[]; translatedName: string }
    > = {}

    filteredCards.forEach(({ card, extraInfo, selectedCard }) => {
      const originalColor = card.color || "Unknown"
      const quantity = extraInfo.amount || 1 // Use amount if available, otherwise default to 1

      // 원본 색상 이름을 저장 (차트 색상 매핑용)
      const colorKey = originalColor

      // 색상 이름 번역
      const translatedColor = getTranslatedString(`color_${originalColor.toLowerCase()}`) || originalColor

      if (!colors[colorKey]) {
        colors[colorKey] = { count: 0, cards: [], translatedName: translatedColor }
      }

      // 캐릭터 이름 가져오기
      let characterName = ""
      if (card.ownerId && card.ownerId !== -1 && data?.characters) {
        const character = data.characters[card.ownerId.toString()]
        if (character) {
          characterName = getTranslatedString(character.name) || character.name
        }
      } else if (selectedCard?.ownerId && selectedCard.ownerId !== -1 && data?.characters) {
        // selectedCard에서 ownerId 확인
        const character = data.characters[selectedCard.ownerId.toString()]
        if (character) {
          characterName = getTranslatedString(character.name) || character.name
        }
      }

      // Add the quantity to the count
      colors[colorKey].count += quantity

      // Check if the card is already in the list
      const existingCard = colors[colorKey].cards.find((c) => c.name === extraInfo.name)
      if (existingCard) {
        existingCard.quantity += quantity
      } else {
        colors[colorKey].cards.push({
          name: extraInfo.name,
          quantity,
          characterName: characterName || "", // 캐릭터 이름이 없으면 빈 문자열로 설정
        })
      }
    })

    return (
      Object.entries(colors)
        .map(([color, data]) => ({
          name: color,
          translatedName: data.translatedName,
          count: data.count,
          cards: data.cards,
          // 색상 순서 인덱스 추가
          orderIndex: colorOrder.indexOf(color) !== -1 ? colorOrder.indexOf(color) : colorOrder.length,
        }))
        // 색상 순서에 따라 정렬
        .sort((a, b) => a.orderIndex - b.orderIndex)
    )
  }, [filteredCards, getTranslatedString, data])

  // Get status effects from tagList
  const statusEffects = useMemo(() => {
    // 모든 태그 ID를 색상 코드에 매핑하는 객체 생성
    const tagToColorMap: Record<string, string> = {}

    // 색상 코드별 태그 ID 배열을 순회하며 매핑 생성
    Object.entries(tagColorMapping).forEach(([colorCode, tagIds]) => {
      tagIds.forEach((tagId) => {
        tagToColorMap[tagId.toString()] = colorCode
      })
    })

    const effectIds = new Set<string>()

    filteredCards.forEach(({ card }) => {
      if (card.tagList && Array.isArray(card.tagList)) {
        card.tagList.forEach((tagItem) => {
          // tagList는 객체 배열이며 각 객체에는 tagId 속성이 있음
          if (tagItem && tagItem.tagId) {
            effectIds.add(tagItem.tagId.toString())
          }
        })
      }
    })

    // Map tagIds to tag names and colors
    return Array.from(effectIds)
      .map((tagId) => {
        const tag = tagData[tagId]
        if (!tag) return null

        // 색상 매핑에 있는 태그만 포함
        const colorCode = tagToColorMap[tagId]
        if (!colorCode) return null

        // Get translated tag name
        const tagName = getTranslatedString(tag.tagName) || tag.tagName

        return {
          id: tagId,
          name: tagName,
          color: colorCode,
        }
      })
      .filter(Boolean)
  }, [filteredCards, tagData, tagColorMapping, getTranslatedString])

  // Total card count
  const totalCards = useMemo(() => {
    return colorDistribution.reduce((sum, color) => sum + color.count, 0)
  }, [colorDistribution])

  return (
    <div className="w-full space-y-6 p-4">
      {/* Derived Cards Toggle */}
      <div className="flex items-center mb-4">
        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out mr-3">
          <input
            type="checkbox"
            id="includeDerivedCards"
            checked={includeDerivedCards}
            onChange={(e) => setIncludeDerivedCards(e.target.checked)}
            className="opacity-0 w-0 h-0"
          />
          <label
            htmlFor="includeDerivedCards"
            className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
              includeDerivedCards ? "bg-blue-600" : "bg-gray-700"
            }`}
            style={{
              boxShadow: includeDerivedCards ? "0 0 8px rgba(59, 130, 246, 0.8)" : "none",
            }}
          >
            <span
              className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ${
                includeDerivedCards ? "transform translate-x-6" : ""
              }`}
            ></span>
          </label>
        </div>
        <label htmlFor="includeDerivedCards" className="text-sm cursor-pointer select-none">
          {getTranslatedString("include_derived_cards") || "Include derived cards"}
        </label>
      </div>

      {/* Total Card Count */}
      <div className="text-sm text-gray-300">
        {getTranslatedString("total_cards") || "Total Cards"}: {totalCards}
      </div>

      {/* Color Distribution Chart */}
      <div className="neon-container p-4">
        <h3 className="text-lg font-semibold mb-4 neon-text">
          {getTranslatedString("color_distribution") || "Color Distribution"}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={colorDistribution}>
              <XAxis dataKey="translatedName" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name === "count" ? getTranslatedString("cards") || "Cards" : name]}
                labelFormatter={(label) => `${label} ${getTranslatedString("cards") || "Cards"}`}
              />
              <Legend />
              <Bar dataKey="count" name="Cards">
                {colorDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.name] || colorMap.Unknown} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cards by Color */}
      <div className="neon-container p-4">
        <h3 className="text-lg font-semibold mb-4 neon-text">
          {getTranslatedString("cards_by_color") || "Cards by Color"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorDistribution.map(({ name, translatedName, cards }) => (
            <div key={name} className="border border-[hsla(var(--neon-white),0.3)] rounded-md p-3">
              <h4 className="font-medium mb-2 flex items-center">
                <span
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: colorMap[name] || colorMap.Unknown }}
                ></span>
                {translatedName} ({cards.reduce((sum, card) => sum + card.quantity, 0)})
              </h4>
              <ul className="text-sm space-y-1 text-gray-300">
                {cards.map((card, index) => (
                  <li key={index}>
                    <span className="text-white">{card.name}</span> {card.quantity > 1 ? `(${card.quantity})` : ""}
                    {card.characterName && card.characterName.length > 0 && (
                      <span className="text-gray-400 ml-1">- {card.characterName}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Status Effects */}
      <div className="neon-container p-4">
        <h3 className="text-lg font-semibold mb-4 neon-text">
          {getTranslatedString("status_effects") || "Status Effects"}
        </h3>
        {statusEffects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {statusEffects.map((effect) => (
              <span
                key={effect.id}
                className="px-2 py-1 bg-black bg-opacity-50 border rounded-md text-sm"
                style={{
                  borderColor: effect.color,
                  color: effect.color,
                  boxShadow: `0 0 5px ${effect.color}40`,
                }}
              >
                {effect.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">{getTranslatedString("no_status_effects") || "No status effects found"}</p>
        )}
      </div>
    </div>
  )
}
