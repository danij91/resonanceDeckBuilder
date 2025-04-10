// Character Types
export interface Character {
  id: number
  name: string
  quality: string
  sideId?: number
  passiveSkillList?: Array<{ skillId: number }>
  skillList: Array<{ num: number; skillId: number }>
  hp_SN?: number
  def_SN?: number
  atk_SN?: number
  atkSpeed_SN?: number
  luck_SN?: number
  talentList?: Array<{ talentId: number }>
  breakthroughList?: Array<{ breakthroughId: number }>
  line?: number
  subLine?: number
  identity?: string
  ability?: string
  img_card?: string
  desc?: string
  rarity?: string
  homeSkillList?: Array<{ id: string; resonanceLv: number; param?: number }>
}

// Card Types
export interface Card {
  id: number
  name: string
  color?: string
  cardType?: string
  ownerId?: number
  idCn?: string // Added for checking neutral cards
  ExCondList?: Array<{
    condId?: number
    des?: number
    interValNum?: number
    isNumCond?: boolean
    minNum?: number
    numDuration?: number
    typeEnum?: string
  }>
  ExActList?: Array<{
    actId?: number
    des?: number
    typeEnum?: string
  }>
}

// Skill Types
export interface Skill {
  id: number
  name: string
  description: string
  detailDescription: string
  ExSkillList: Array<{
    ExSkillName: number
    isNeturality: boolean
  }>
  cardID?: number | null
  leaderCardConditionDesc?: string
}

// Breakthrough Types
export interface Breakthrough {
  id: number
  name: string
  desc: string
  attributeList: any[]
}

// Talent Types
export interface Talent {
  id: number
  name: string
  desc: string
  awakeLv: number
  skillParamOffsetList?: Array<{
    skillId: number
    tag: string
    value_SN: number
  }> | null
}

// HomeSkill Types
export interface HomeSkill {
  id: string
  name: string
  desc: string
  param?: number
}

// Image Database Type
export interface ImageDatabase {
  [key: string]: string
}

// Language Types
export interface LanguageStrings {
  [key: string]: string | null
}

export interface Languages {
  [langCode: string]: LanguageStrings
}

// Preset Types
export interface Preset {
  roleList: number[]
  header: number
  cardList: PresetCard[]
  isLeaderCardOn: boolean
  isSpCardOn: boolean
  keepCardNum: number
  discardType: number
  otherCard: number
}

// Update the PresetCard interface to make skillIndex optional
export interface PresetCard {
  id: string
  ownerId?: number
  skillId?: number
  skillIndex?: number // Now optional
  targetType?: number
  useType: number
  useParam: number
  useParamMap?: Record<string, number>
  equipIdList?: string[]
}

// Equipment Types
export interface Equipment {
  id: number
  name: string
  des: string
  equipTagId: number
  quality: string
  type?: string // weapon, armor, accessory
  url?: string
  skillList?: Array<{ skillId: number }>
  Getway?: Array<{ DisplayName: string }> // 획득 방법 배열 추가
}

// Equipment Type Mapping
export interface EquipmentTypeMapping {
  [equipTagId: string]: string
}

// Database Types
export interface Database {
  characters: Record<string, Character>
  cards: Record<string, Card>
  skills: Record<string, Skill>
  breakthroughs: Record<string, Breakthrough>
  talents: Record<string, Talent>
  images: ImageDatabase
  languages: Languages
  equipments?: Record<string, Equipment>
  equipmentTypes?: EquipmentTypeMapping
  homeSkills?: Record<string, HomeSkill>
  charSkillMap?: Record<
    string,
    {
      relatedSkill: number[]
      notFromCharacters: number[]
    }
  >
}

export interface CardExtraInfo {
  name: string
  desc: string
  cost: number
  amount: number
  img_url?: string
  specialCtrl?: string[]
}

export interface SpecialControl {
  text: string
  icon?: string
  minimum?: string
  maximum?: string
}
