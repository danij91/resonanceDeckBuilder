import type { Database, Skill } from "../../types"
import type { CardSource, SelectedCard, EquipmentSlot } from "./types"

// 캐릭터 ID로 캐릭터 정보 가져오기
export function getCharacterById(data: Database | null, id: number) {
  if (!data || id === -1) return null
  return data.characters[id.toString()]
}

// 카드 ID로 카드 정보 가져오기
export function getCardById(data: Database | null, id: string) {
  if (!data) return null
  return data.cards[id]
}

// 스킬 ID로 스킬 정보 가져오기
export function getSkillById(data: Database | null, skillId: number): Skill | null {
  if (!data) return null
  return data.skills[skillId.toString()] || null
}

// 장비 ID로 장비 정보 가져오기
export function getEquipmentById(data: Database | null, equipId: string) {
  if (!data || !data.equipments) return null
  return data.equipments[equipId] || null
}

// 카드 소스 비교 함수
export function isSameSource(source1: CardSource, source2: CardSource): boolean {
  if (source1.type !== source2.type) return false
  if (source1.id !== source2.id) return false
  if (source1.skillId !== source2.skillId) return false
  if (source1.slotIndex !== source2.slotIndex) return false

  if (source1.type === "equipment" && source2.type === "equipment") {
    return source1.equipType === source2.equipType
  }

  return true
}

// 카드에 특정 소스가 있는지 확인
export function hasSource(card: SelectedCard, source: CardSource): boolean {
  return card.sources.some((s) => isSameSource(s, source))
}

// 카드 ID가 유효한지 확인
export function isValidCardId(data: Database | null, cardId: string): boolean {
  if (!data) return false
  return !!data.cards[cardId]
}

// 사용 가능한 카드 ID 목록 가져오기 함수 수정
export function getAvailableCardIds(
  data: Database | null,
  selectedCharacters: number[],
  equipment: EquipmentSlot[],
): Set<string> {
  const availableCardIds = new Set<string>()

  if (!data) return availableCardIds

  // 선택된 캐릭터의 스킬에서 카드 ID 수집
  const validCharacters = selectedCharacters.filter((id) => id !== -1)

  // 각 캐릭터의 스킬 맵에서 카드 ID 찾기
  validCharacters.forEach((charId) => {
    const charSkillMap = data.charSkillMap?.[charId.toString()]
    if (!charSkillMap) return

    // relatedSkill 처리
    if (charSkillMap.relatedSkill) {
      charSkillMap.relatedSkill.forEach((skillId: number) => {
        const skill = data.skills[skillId.toString()]
        if (skill && skill.cardID) {
          availableCardIds.add(skill.cardID.toString())
        }
      })
    }

    // notFromCharacters 처리
    if (charSkillMap.notFromCharacters) {
      charSkillMap.notFromCharacters.forEach((skillId: number) => {
        const skill = data.skills[skillId.toString()]
        if (skill && skill.cardID) {
          availableCardIds.add(skill.cardID.toString())
        }
      })
    }
  })

  // 장비에서도 카드 ID 수집 (기존 로직 유지)
  validCharacters.forEach((charId, slotIndex) => {
    const charEquipment = equipment[slotIndex]

    // 각 장비 타입별로 처리
    const processEquipment = (equipId: string | null, equipType: "weapon" | "armor" | "accessory") => {
      if (!equipId) return

      const equip = data.equipments?.[equipId]
      if (!equip || !equip.skillList) return

      equip.skillList.forEach((skillItem) => {
        const skill = data.skills[skillItem.skillId.toString()]
        if (skill && skill.cardID) {
          availableCardIds.add(skill.cardID.toString())
        }

        // ExSkillList에서 카드 ID 찾기
        if (skill && skill.ExSkillList && skill.ExSkillList.length > 0) {
          skill.ExSkillList.forEach((exSkill) => {
            const exSkillData = data.skills[exSkill.ExSkillName.toString()]
            if (exSkillData && exSkillData.cardID) {
              availableCardIds.add(exSkillData.cardID.toString())
            }
          })
        }
      })
    }

    processEquipment(charEquipment.weapon, "weapon")
    processEquipment(charEquipment.armor, "armor")
    processEquipment(charEquipment.accessory, "accessory")
  })

  return availableCardIds
}
