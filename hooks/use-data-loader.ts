"use client"

import { useEffect, useState } from "react"
import type { Database } from "../types"
import { dummyData } from "../dummy"

// Flag to control data source - 더미 데이터 사용 여부
const USE_DUMMY = false

export function useDataLoader() {
  const [data, setData] = useState<Database | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        if (USE_DUMMY) {
          setData(dummyData)
        } else {
          // 절대 경로 사용하여 데이터 파일 로드
          const [
            charactersResponse,
            cardsResponse,
            skillsResponse,
            breakthroughsResponse,
            talentsResponse,
            imagesResponse,
            excludeCardResponse,
            equipmentsResponse,
            homeSkillsResponse, // 홈 스킬 데이터 추가
          ] = await Promise.all([
            fetch("/api/db/char_db.json"),
            fetch("/api/db/card_db.json"),
            fetch("/api/db/skill_db.json"),
            fetch("/api/db/break_db.json"),
            fetch("/api/db/talent_db.json"),
            fetch("/api/db/img_db.json"),
            fetch("/api/db/temp_exclude_card.json"),
            fetch("/api/db/equip_db.json"),
            fetch("/api/db/home_skill_db.json"), // 홈 스킬 데이터 추가
          ])

          const [characters, cards, skills, breakthroughs, talents, images, excludeCard, equipments, homeSkills] =
            await Promise.all([
              charactersResponse.json(),
              cardsResponse.json(),
              skillsResponse.json(),
              breakthroughsResponse.json(),
              talentsResponse.json(),
              imagesResponse.json(),
              excludeCardResponse.json(),
              equipmentsResponse.json(),
              homeSkillsResponse.json(), // 홈 스킬 데이터 추가
            ])

          // 언어 파일 목록 - 언어별로 다른 경로에서 로드 (절대 경로 사용)
          const supportedLanguages = ["ko", "en", "jp", "cn"]
          const languagePromises = supportedLanguages.map((lang) =>
            fetch(`/api/db/lang_${lang}.json`).then((res) => res.json()),
          )
          const languageData = await Promise.all(languagePromises)

          // 언어 데이터 구성
          const languages: Record<string, any> = {}
          supportedLanguages.forEach((lang, index) => {
            languages[lang] = languageData[index]
          })

          // Add image URLs to characters
          Object.keys(characters).forEach((charId) => {
            const charImgKey = `char_${charId}`
            if (images[charImgKey]) {
              characters[charId].img_card = images[charImgKey]
            }
          })

          // Process characters to add backward compatibility fields
          Object.keys(characters).forEach((charId) => {
            const char = characters[charId]

            // Map quality to rarity for backward compatibility
            const qualityToRarity: Record<string, string> = {
              oneStar: "N-",
              twoStar: "N",
              threeStar: "R",
              fourStar: "SR",
              FiveStar: "SSR",
              SixStar: "UR",
            }

            // Add rarity field for backward compatibility
            char.rarity = qualityToRarity[char.quality] || "N-"

            // Add desc field for backward compatibility
            char.desc = char.identity || `char_desc_${charId}`
          })

          // Process equipment types
          const equipmentTypes = excludeCard.equipmentTypes || {}

          // Add type to equipment based on equipTagId
          Object.keys(equipments).forEach((equipId) => {
            const equipment = equipments[equipId]
            const tagId = equipment.equipTagId
            if (equipmentTypes[tagId]) {
              equipment.type = equipmentTypes[tagId]
            }

            // Add image URL if available
            const equipImgKey = `equip_${equipId}`
            if (images[equipImgKey]) {
              equipment.url = images[equipImgKey]
            }

            // Ensure skillList is properly initialized if it exists
            if (equipment.skillList && Array.isArray(equipment.skillList)) {
              // skillList is already properly formatted, no need to modify
            } else if (equipment.skillList) {
              // If skillList exists but is not an array, convert it to proper format
              const skillListObj = equipment.skillList as unknown as Record<string, any>
              const skillListArray = Object.keys(skillListObj).map((key) => ({
                skillId: Number(skillListObj[key].skillId || key),
              }))
              equipment.skillList = skillListArray
            }
          })

          setData({
            characters,
            cards,
            skills,
            breakthroughs,
            talents,
            images,
            languages,
            excludedSkillIds: excludeCard.excludedSkillIds || [],
            specialSkillIds: excludeCard.specialSkillIds || [],
            equipments,
            equipmentTypes,
            homeSkills, // 홈 스킬 데이터 추가
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { data, loading, error }
}

