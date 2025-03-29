import type { Database, Preset } from "../types"

// Dummy data for v0 environment
export const dummyData: Database = {
  characters: {
    "10000025": {
      id: 10000025,
      name: "char_name_10000025",
      quality: "ThreeStar",
      rarity: "SR",
      desc: "char_desc_10000025",
      img_card: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
      skillList: [
        {
          num: 2,
          skillId: 12300019,
        },
        {
          num: 2,
          skillId: 12300020,
        },
        {
          num: 1,
          skillId: 12300021,
        },
      ],
      hp_SN: 70000000,
      def_SN: 720000,
      atk_SN: 750000,
      atkSpeed_SN: 1000000,
      luck_SN: 0,
      talentList: [
        {
          talentId: 12800016,
        },
        {
          talentId: 12800017,
        },
        {
          talentId: 12800514,
        },
        {
          talentId: 12800019,
        },
      ],
      breakthroughList: [
        {
          breakthroughId: 12100130,
        },
        {
          breakthroughId: 12100116,
        },
        {
          breakthroughId: 12100117,
        },
        {
          breakthroughId: 12100745,
        },
        {
          breakthroughId: 12100746,
        },
        {
          breakthroughId: 12100120,
        },
      ],
      line: 2,
      subLine: 140,
      identity: "char_identity_10000025",
      ability: "char_ability_10000025",
    },
    "10000004": {
      id: 10000004,
      name: "char_name_10000004",
      quality: "FiveStar",
      rarity: "SSR",
      desc: "char_desc_10000004",
      img_card: "https://patchwiki.biligame.com/images/resonance/1/1a/51urp8w56ytk1yu5qbcokrijok8og2i.png",
      sideId: 12600031,
      passiveSkillList: [
        {
          skillId: 12300972,
        },
      ],
      skillList: [
        {
          num: 2,
          skillId: 12300022,
        },
        {
          num: 2,
          skillId: 12300023,
        },
        {
          num: 1,
          skillId: 12300024,
        },
      ],
      hp_SN: 78000000,
      def_SN: 800000,
      atk_SN: 800000,
      atkSpeed_SN: 1000000,
      luck_SN: 0,
      talentList: [
        {
          talentId: 12800002,
        },
        {
          talentId: 12800039,
        },
        {
          talentId: 12800540,
        },
        {
          talentId: 12800040,
        },
        {
          talentId: 12800197,
        },
      ],
      breakthroughList: [
        {
          breakthroughId: 12100055,
        },
        {
          breakthroughId: 12100056,
        },
        {
          breakthroughId: 12100057,
        },
        {
          breakthroughId: 12100791,
        },
        {
          breakthroughId: 12100792,
        },
        {
          breakthroughId: 12100060,
        },
      ],
      line: 1,
      subLine: 930,
      identity: "char_identity_10000004",
      ability: "char_ability_10000004",
    },
  },
  cards: {
    "10600004": {
      id: 10600004,
      name: "card_name_10600004",
      color: "Yellow",
      cardType: "Normal",
      ownerId: 10000025,
      idCn: "normal_card_10600004", // Regular card
      ExCondList: [
        {
          condId: 96200029,
          des: 80608007,
          interValNum: 12,
          isNumCond: true,
          minNum: 0,
          numDuration: 1,
          typeEnum: "number",
        },
      ],
      ExActList: [
        {
          actId: 1001,
          des: 80608010,
          typeEnum: "action",
        },
      ],
    },
    "10600005": {
      id: 10600005,
      name: "card_name_10600005",
      color: "Red",
      cardType: "Normal",
      ownerId: 10000004,
      idCn: "中立卡_10600005", // Neutral card
      ExCondList: [
        {
          condId: 96200030,
          des: 80608008,
          interValNum: 10,
          isNumCond: true,
          minNum: 30,
          numDuration: 5,
          typeEnum: "greaterequal",
        },
      ],
    },
    "10600014": {
      id: 10600014,
      name: "card_name_10600014",
      color: "Blue",
      cardType: "Special",
      ownerId: 10000025,
      idCn: "special_card_10600014", // Regular card
      ExCondList: [
        {
          condId: 96200031,
          des: 80608009,
          interValNum: 8,
          isNumCond: true,
          minNum: 10,
          numDuration: 10,
          typeEnum: "lessequal",
        },
      ],
    },
  },
  skills: {
    "12300007": {
      id: 12300007,
      name: "skill_name_12300007",
      description: "skill_description_12300007",
      detailDescription: "skill_detailDescription_12300007",
      ExSkillList: [],
      cardID: null,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300007",
    },
    "12300019": {
      id: 12300019,
      name: "skill_name_12300019",
      description: "skill_description_12300019",
      detailDescription: "skill_detailDescription_12300019",
      ExSkillList: [
        {
          ExSkillName: 12300636,
          isNeturality: false,
        },
      ],
      cardID: 10600014,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300019",
    },
    "12300020": {
      id: 12300020,
      name: "skill_name_12300020",
      description: "skill_description_12300020",
      detailDescription: "skill_detailDescription_12300020",
      ExSkillList: [],
      cardID: 10600004,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300020",
    },
    "12300021": {
      id: 12300021,
      name: "skill_name_12300021",
      description: "skill_description_12300021",
      detailDescription: "skill_detailDescription_12300021",
      ExSkillList: [],
      cardID: 10600005,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300021",
    },
    "12300022": {
      id: 12300022,
      name: "skill_name_12300022",
      description: "skill_description_12300022",
      detailDescription: "skill_detailDescription_12300022",
      ExSkillList: [],
      cardID: 10600004,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300022",
    },
    "12300023": {
      id: 12300023,
      name: "skill_name_12300023",
      description: "skill_description_12300023",
      detailDescription: "skill_detailDescription_12300023",
      ExSkillList: [],
      cardID: 10600005,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300023",
    },
    "12300024": {
      id: 12300024,
      name: "skill_name_12300024",
      description: "skill_description_12300024",
      detailDescription: "skill_detailDescription_12300024",
      ExSkillList: [],
      cardID: 10600014,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300024",
    },
    "12300636": {
      id: 12300636,
      name: "skill_name_12300636",
      description: "skill_description_12300636",
      detailDescription: "skill_detailDescription_12300636",
      ExSkillList: [],
      cardID: 10600005,
      leaderCardConditionDesc: "skill_leaderCardConditionDesc_12300636",
    },
  },
  breakthroughs: {
    "12100001": {
      id: 12100001,
      name: "break_name_12100001",
      desc: "break_desc_12100001",
      attributeList: [],
    },
    "12100008": {
      id: 12100008,
      name: "break_name_12100008",
      desc: "break_desc_12100008",
      attributeList: [],
    },
  },
  talents: {
    "12800001": {
      id: 12800001,
      name: "talent_name_12800001",
      desc: "talent_desc_12800001",
      awakeLv: 0,
      skillParamOffsetList: null,
    },
    "12800002": {
      id: 12800002,
      name: "talent_name_12800002",
      desc: "talent_desc_12800002",
      awakeLv: 2,
      skillParamOffsetList: [
        {
          skillId: 12300023,
          tag: "A",
          value_SN: 20000,
        },
      ],
    },
  },
  images: {
    char_10000004: "https://patchwiki.biligame.com/images/resonance/1/1a/51urp8w56ytk1yu5qbcokrijok8og2i.png",
    char_10000025: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
    card_12300007: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
    card_12300019: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
    card_10600004: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
    card_10600005: "https://patchwiki.biligame.com/images/resonance/1/1a/51urp8w56ytk1yu5qbcokrijok8og2i.png",
    card_10600014: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
  },
  languages: {
    ko: {
      break_name_12100008: "마녀의 조건",
      break_desc_12100008: "전투 시작 시 비용을 1 소모하여 이번 전투 동안 손패 보충 쿨타임을 1초 감소시킵니다.",
      break_name_12100009: "다크 아트",
      break_desc_12100009: "자신의 스킬 카드 사용 시 50% 확률로 [다크 아트]를 1장 생성하여 손으로 가져옵니다.",
      break_name_12100010: "투지",
      break_desc_12100010: "공격력+150",
      break_name_12100034: "운명",
      break_desc_12100034: "전투 시작 시 덱에서 [충격검]을 1장 뽑아 손으로 가져옵니다.",
      break_name_12100035: "사경",
      break_desc_12100035:
        "빈사 시 <color=#7AB2FF>[무적]</color>을 3초간 얻고, 동시에 [종막의 원무곡·레드]를 즉시 사용합니다.(1회 한정)",
      char_name_10000025: "줄리안",
      char_desc_10000025: "설명을 입력해주세요",
      char_name_10000004: "아이리스",
      char_desc_10000004: "설명을 입력해주세요",
      card_name_10600004: "기본 공격",
      card_desc_10600004: "적에게 물리 피해를 줍니다",
      card_name_10600005: "방어 태세",
      card_desc_10600005: "방어력을 증가시킵니다",
      card_name_10600014: "특수 공격",
      card_desc_10600014: "적에게 특수 피해를 줍니다",
      text_80608007: "HP 50% 이하",
      text_80608008: "HP 70% 이상",
      text_80608009: "MP 10% 이하",
      text_80608010: "즉시 회복",
      equipment_name_11800001: "황금 검",
      equipment_des_11800001: "강력한 황금 검입니다.",
      equipment_name_11800002: "마법 갑옷",
      equipment_des_11800002: "마법으로 강화된 갑옷입니다.",
      equipment_name_11800003: "행운의 목걸이",
      equipment_des_11800003: "행운을 가져다주는 목걸이입니다.",
      equipment_name_11800028: "청룡검",
      equipment_des_11800028: "청룡의 힘이 깃든 검입니다.",
      equipment_type_weapon: "무기",
      equipment_type_armor: "방어구",
      equipment_type_accessory: "악세서리",
      search_equipment: "장비 검색",
      sort_by_quality: "품질순 정렬",
      no_equipment_found: "장비를 찾을 수 없습니다",
      equipment_details: "장비 상세정보",
      equipment_description: "설명",
    },
    en: {
      break_name_12100008: "Witch's Condition",
      break_desc_12100008:
        "At the start of battle, consume 1 cost to reduce hand replenishment cooldown by 1 second for this battle.",
      break_name_12100009: "Dark Arts",
      break_desc_12100009:
        "When using your skill card, there's a 50% chance to generate 1 [Dark Arts] and add it to your hand.",
      break_name_12100010: "Fighting Spirit",
      break_desc_12100010: "Attack +150",
      break_name_12100034: "Destiny",
      break_desc_12100034: "At the start of battle, draw 1 [Shock Sword] from your deck and add it to your hand.",
      break_name_12100035: "Dire Straits",
      break_desc_12100035:
        "When near death, gain <color=#7AB2FF>[Invincibility]</color> for 3 seconds and immediately use [Finale Waltz·Red]. (Limited to once)",
      char_name_10000025: "Julian",
      char_desc_10000025: "Please enter description",
      char_name_10000004: "Iris",
      char_desc_10000004: "Please enter description",
      card_name_10600004: "Basic Attack",
      card_desc_10600004: "Deal physical damage to enemy",
      card_name_10600005: "Defensive Stance",
      card_desc_10600005: "Increase defense",
      card_name_10600014: "Special Attack",
      card_desc_10600014: "Deal special damage to enemy",
      text_80608007: "HP below 50%",
      text_80608008: "HP above 70%",
      text_80608009: "MP below 10%",
      text_80608010: "Instant Recovery",
      equipment_name_11800001: "Golden Sword",
      equipment_des_11800001: "A powerful golden sword.",
      equipment_name_11800002: "Magic Armor",
      equipment_des_11800002: "Armor enhanced with magic.",
      equipment_name_11800003: "Lucky Necklace",
      equipment_des_11800003: "A necklace that brings luck.",
      equipment_name_11800028: "Blue Dragon Sword",
      equipment_des_11800028: "A sword imbued with the power of the blue dragon.",
      equipment_type_weapon: "Weapon",
      equipment_type_armor: "Armor",
      equipment_type_accessory: "Accessory",
      search_equipment: "Search equipment",
      sort_by_quality: "Sort by Quality",
      no_equipment_found: "No equipment found",
      equipment_details: "Equipment Details",
      equipment_description: "Description",
    },
    jp: {
      break_name_12100008: "魔女の条件",
      break_desc_12100008: "戦闘開始時、コストを1消費して、この戦闘中の手札補充クールタイムを1秒短縮します。",
      break_name_12100009: "ダークアーツ",
      break_desc_12100009: "自分のスキルカード使用時、50%の確率で[ダークアーツ]を1枚生成して手札に加えます。",
      break_name_12100010: "闘志",
      break_desc_12100010: "攻撃力+150",
      break_name_12100034: "運命",
      break_desc_12100034: "戦闘開始時、デッキから[衝撃剣]を1枚引いて手札に加えます。",
      break_name_12100035: "危機",
      break_desc_12100035:
        "瀕死時、<color=#7AB2FF>[無敵]</color>を3秒間獲得し、同時に[終幕の円舞曲・レッド]を即座に使用します。(1回限り)",
      char_name_10000025: "ジュリアン",
      char_desc_10000025: "説明を入力してください",
      char_name_10000004: "アイリス",
      char_desc_10000004: "説明を入力してください",
      card_name_10600004: "基本攻撃",
      card_desc_10600004: "敵に物理ダメージを与えます",
      card_name_10600005: "防御態勢",
      card_desc_10600005: "防御力を増加させます",
      card_name_10600014: "特殊攻撃",
      card_desc_10600014: "敵に特殊ダメージを与えます",
      text_80608007: "HP 50%以下",
      text_80608008: "HP 70%以上",
      text_80608009: "MP 10%以下",
      text_80608010: "即時回復",
    },
    cn: {
      break_name_12100008: "魔女的条件",
      break_desc_12100008: "开局消耗1点费用，使本场战斗手牌补充冷却时间缩短1秒",
      break_name_12100009: "暗艺",
      break_desc_12100009: "使用自身技能牌后，有50%概率生成1张【暗艺】加入手牌",
      break_name_12100010: "斗志",
      break_desc_12100010: "攻击力+150",
      break_name_12100034: "命运",
      break_desc_12100034: "开局从牌库中抽1张【冲击剑】加入手牌",
      break_name_12100035: "绝境",
      break_desc_12100035: "濒死时<color=#7AB2FF>【无敌】</color>3秒，同时直接使用【终幕的圆舞曲·红】，限1次",
      char_name_10000025: "朱利安",
      char_desc_10000025: "请输入描述",
      char_name_10000004: "艾丽丝",
      char_desc_10000004: "请输入描述",
      card_name_10600004: "基本攻击",
      card_desc_10600004: "对敌人造成物理伤害",
      card_name_10600005: "防御姿态",
      card_desc_10600005: "增加防御力",
      card_name_10600014: "特殊攻击",
      card_desc_10600014: "对敌人造成特殊伤害",
      text_80608007: "HP 50%以下",
      text_80608008: "HP 70%以上",
      text_80608009: "MP 10%以下",
      text_80608010: "立即恢复",
    },
  },
  // 추가: 제외할 스킬 ID 목록
  excludedSkillIds: [12300636, 12300007],
  // 추가: 특수 스킬 ID 목록 (ownerId가 10000001이 되어야 하는 스킬)
  specialSkillIds: [12300636],
  equipments: {
    "11800001": {
      id: 11800001,
      name: "equipment_name_11800001",
      des: "equipment_des_11800001",
      equipTagId: 12600155,
      quality: "Golden",
      type: "weapon",
      url: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
    },
    "11800002": {
      id: 11800002,
      name: "equipment_name_11800002",
      des: "equipment_des_11800002",
      equipTagId: 12600161,
      quality: "Purple",
      type: "armor",
      url: "https://patchwiki.biligame.com/images/resonance/1/1a/51urp8w56ytk1yu5qbcokrijok8og2i.png",
    },
    "11800003": {
      id: 11800003,
      name: "equipment_name_11800003",
      des: "equipment_des_11800003",
      equipTagId: 12600162,
      quality: "Blue",
      type: "accessory",
      url: "https://patchwiki.biligame.com/images/resonance/3/39/gkf4tscz3e7u5ahmzl4frhliehe4f97.png",
    },
    "11800028": {
      id: 11800028,
      name: "equipment_name_11800028",
      des: "equipment_des_11800028",
      equipTagId: 12600155,
      quality: "Blue",
      type: "weapon",
      url: "https://patchwiki.biligame.com/images/resonance/1/1a/51urp8w56ytk1yu5qbcokrijok8og2i.png",
    },
  },
  equipmentTypes: {
    "12600155": "weapon",
    "12600161": "armor",
    "12600162": "accessory",
  },
}

export const dummyPreset: Preset = {
  roleList: [10000025, -1, -1, 10000004, -1],
  header: 10000025,
  cardList: [
    {
      id: "10600004",
      useType: 1,
      useParam: -1,
    },
  ],
  isLeaderCardOn: true,
  isSpCardOn: true,
  keepCardNum: 3,
  discardType: 2,
  otherCard: 0,
}

