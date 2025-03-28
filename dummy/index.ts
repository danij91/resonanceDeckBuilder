import type { Database, Preset } from "../types"

// Dummy data for v0 environment
export const dummyData: Database = {
  characters: {
    "10000025": {
      id: 10000025,
      name: "char_name_10000025",
      rarity: "R",
      desc: "char_desc_10000025",
      img_card: "https://patchwiki.biligame.com/images/resonance/5/5f/fove629a7cnqli99apcr5nfpfm9uz22.png",
      skills: {
        "1": "10600014",
        "2": "10600015",
        "3": "10600016",
      },
      produceSkills: ["10600075", "10600044"], // Added produceSkills
      awakening: [
        {
          name: "char_awake_name_10000025_1",
          desc: "char_awake_desc_10000025_1",
        },
        {
          name: "char_awake_name_10000025_2",
          desc: "char_awake_desc_10000025_2",
        },
        {
          name: "char_awake_name_10000025_3",
          desc: "char_awake_desc_10000025_3",
        },
        {
          name: "char_awake_name_10000025_4",
          desc: "char_awake_desc_10000025_4",
        },
        {
          name: "char_awake_name_10000025_5",
          desc: "char_awake_desc_10000025_5",
        },
      ],
      resonance: [
        {
          name: "char_reson_name_10000025_1",
          desc: "char_reson_desc_10000025_1",
        },
        {
          name: "char_reson_name_10000025_2",
          desc: "char_reson_desc_10000025_2",
        },
        {
          name: "char_reson_name_10000025_3",
          desc: "char_reson_desc_10000025_3",
        },
        {
          name: "char_reson_name_10000025_4",
          desc: "char_reson_desc_10000025_4",
        },
      ],
    },
    "10000027": {
      id: 10000027,
      name: "char_name_10000027",
      rarity: "SR",
      desc: "char_desc_10000027",
      img_card: "https://patchwiki.biligame.com/images/resonance/c/c0/ttk4iasqbm7ua9t5grid0ntz66l6klv.png",
      skills: {
        "1": "10600017",
        "2": "10600018",
        "3": "10600019",
      },
      produceSkills: ["10600262"], // Added produceSkills
      awakening: [
        {
          name: "char_awake_name_10000027_1",
          desc: "char_awake_desc_10000027_1",
        },
      ],
      resonance: [
        {
          name: "char_reson_name_10000027_1",
          desc: "char_reson_desc_10000027_1",
        },
      ],
    },
    "10000031": {
      id: 10000031,
      name: "char_name_10000031",
      rarity: "SSR",
      desc: "char_desc_10000031",
      img_card: "https://patchwiki.biligame.com/images/resonance/8/82/fsgbawbdejfqb0r5eeaadi676lyr53c.png",
      skills: {
        "1": "10600262",
        "2": "10600263",
        "3": "10600264",
      },
      produceSkills: ["10600075"], // Added produceSkills
      awakening: [
        {
          name: "char_awake_name_10000031_1",
          desc: "char_awake_desc_10000031_1",
        },
      ],
      resonance: [
        {
          name: "char_reson_name_10000031_1",
          desc: "char_reson_desc_10000031_1",
        },
      ],
    },
    "10000032": {
      id: 10000032,
      name: "char_name_10000032",
      rarity: "SR",
      desc: "char_desc_10000032",
      img_card:
        "https://patchwiki.biligame.com/images/resonance/thumb/e/ee/fq0fep0m7gviwrodzkw2e9ob2vagiyx.png/180px-%E4%BC%AA%E7%A5%9E%E4%BD%8E%E8%AF%AD.png",
      skills: {
        "1": "10600020",
        "2": "10600021",
        "3": "10600022",
      },
      produceSkills: ["10600270"], // Added produceSkills
      awakening: [
        {
          name: "char_awake_name_10000032_1",
          desc: "char_awake_desc_10000032_1",
        },
      ],
      resonance: [
        {
          name: "char_reson_name_10000032_1",
          desc: "char_reson_desc_10000032_1",
        },
      ],
    },
    "10000047": {
      id: 10000047,
      name: "char_name_10000047",
      rarity: "SSR",
      desc: "char_desc_10000047",
      img_card:
        "https://nng-phinf.pstatic.net/MjAyNTAyMDhfMjE4/MDAxNzM5MDAzMDQ4Njgy.wz7wbNvBL8FzGmZ0CaW7NjxuJNylruigHENvgj0SCmUg.w7WhK-CicD2skUmH2howWXyhm77yVYMs7LoJrzg0eIsg.PNG/%E7%A9%BA%E9%97%B4%E5%88%87%E7%BA%BF.png",
      skills: {
        "1": "10600075",
        "2": "10600076",
        "3": "10600077",
      },
      produceSkills: ["10600044", "10600270"], // Added produceSkills
      awakening: [
        {
          name: "char_awake_name_10000047_1",
          desc: "char_awake_desc_10000047_1",
        },
      ],
      resonance: [
        {
          name: "char_reson_name_10000047_1",
          desc: "char_reson_desc_10000047_1",
        },
      ],
    },
  },
  cards: {
    "10600014": {
      id: "10600014",
      ownerId: 10000025,
      skillId: "12300014",
      skillIndex: 1,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600015": {
      id: "10600015",
      ownerId: 10000025,
      skillId: "12300015",
      skillIndex: 2,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600016": {
      id: "10600016",
      ownerId: 10000025,
      skillId: "12300016",
      skillIndex: 3,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600017": {
      id: "10600017",
      ownerId: 10000027,
      skillId: "12300017",
      skillIndex: 1,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600018": {
      id: "10600018",
      ownerId: 10000027,
      skillId: "12300018",
      skillIndex: 2,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600019": {
      id: "10600019",
      ownerId: 10000027,
      skillId: "12300019",
      skillIndex: 3,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600262": {
      id: "10600262",
      ownerId: 10000031,
      skillId: "12300262",
      skillIndex: 1,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600263": {
      id: "10600263",
      ownerId: 10000031,
      skillId: "12300263",
      skillIndex: 2,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600264": {
      id: "10600264",
      ownerId: 10000031,
      skillId: "12300264",
      skillIndex: 3,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600075": {
      id: "10600075",
      ownerId: 10000047,
      skillId: "12300075",
      skillIndex: 1,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600076": {
      id: "10600076",
      ownerId: 10000047,
      skillId: "12300076",
      skillIndex: 2,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600077": {
      id: "10600077",
      ownerId: 10000047,
      skillId: "12300077",
      skillIndex: 3,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600044": {
      id: "10600044",
      ownerId: 10000047,
      skillId: "12300044",
      skillIndex: 1,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
    "10600270": {
      id: "10600270",
      ownerId: 10000055,
      skillId: "12300270",
      skillIndex: 1,
      targetType: 0,
      useParam: -1,
      useParamMap: {},
      useType: 1,
      equipIdList: [],
    },
  },
  cardExtraInfo: {
    "10600014": {
      id: 10600014,
      amount: "1",
      cost: "2",
      desc: "card_desc_10600014",
      name: "card_name_10600014",
      img_url: "https://patchwiki.biligame.com/images/resonance/6/65/p775m9fv0bakvr0hkzsmd23o08i96h2.png",
    },
    "10600015": {
      id: 10600015,
      amount: "1",
      cost: "3",
      desc: "card_desc_10600015",
      name: "card_name_10600015",
      img_url: "https://patchwiki.biligame.com/images/resonance/c/c0/ttk4iasqbm7ua9t5grid0ntz66l6klv.png",
    },
    "10600016": {
      id: 10600016,
      amount: "1",
      cost: "4",
      desc: "card_desc_10600016",
      name: "card_name_10600016",
      img_url: "https://patchwiki.biligame.com/images/resonance/8/82/fsgbawbdejfqb0r5eeaadi676lyr53c.png",
      specialCtrl: ["0", "1"],
    },
    "10600017": {
      id: 10600017,
      amount: "1",
      cost: "2",
      desc: "card_desc_10600017",
      name: "card_name_10600017",
      img_url: "https://patchwiki.biligame.com/images/resonance/6/65/p775m9fv0bakvr0hkzsmd23o08i96h2.png",
    },
    "10600018": {
      id: 10600018,
      amount: "1",
      cost: "3",
      desc: "card_desc_10600018",
      name: "card_name_10600018",
      img_url: "https://patchwiki.biligame.com/images/resonance/c/c0/ttk4iasqbm7ua9t5grid0ntz66l6klv.png",
    },
    "10600019": {
      id: 10600019,
      amount: "1",
      cost: "4",
      desc: "card_desc_10600019",
      name: "card_name_10600019",
      img_url: "https://patchwiki.biligame.com/images/resonance/8/82/fsgbawbdejfqb0r5eeaadi676lyr53c.png",
      specialCtrl: ["5", "6"],
    },
    "10600262": {
      id: 10600262,
      amount: "2",
      cost: "3",
      desc: "card_desc_10600262",
      name: "card_name_10600262",
      img_url: "https://patchwiki.biligame.com/images/resonance/c/c0/ttk4iasqbm7ua9t5grid0ntz66l6klv.png",
    },
    "10600263": {
      id: 10600263,
      amount: "1",
      cost: "2",
      desc: "card_desc_10600263",
      name: "card_name_10600263",
      img_url: "https://patchwiki.biligame.com/images/resonance/6/65/p775m9fv0bakvr0hkzsmd23o08i96h2.png",
    },
    "10600264": {
      id: 10600264,
      amount: "1",
      cost: "5",
      desc: "card_desc_10600264",
      name: "card_name_10600264",
      img_url: "https://patchwiki.biligame.com/images/resonance/8/82/fsgbawbdejfqb0r5eeaadi676lyr53c.png",
      specialCtrl: ["2", "7"],
    },
    "10600075": {
      id: 10600075,
      amount: "1",
      cost: "2",
      desc: "card_desc_10600075",
      name: "card_name_10600075",
      img_url: "https://patchwiki.biligame.com/images/resonance/6/65/p775m9fv0bakvr0hkzsmd23o08i96h2.png",
    },
    "10600076": {
      id: 10600076,
      amount: "1",
      cost: "3",
      desc: "card_desc_10600076",
      name: "card_name_10600076",
      img_url: "https://patchwiki.biligame.com/images/resonance/c/c0/ttk4iasqbm7ua9t5grid0ntz66l6klv.png",
    },
    "10600077": {
      id: 10600077,
      amount: "1",
      cost: "4",
      desc: "card_desc_10600077",
      name: "card_name_10600077",
      img_url: "https://patchwiki.biligame.com/images/resonance/8/82/fsgbawbdejfqb0r5eeaadi676lyr53c.png",
      specialCtrl: ["3", "4"],
    },
    "10600044": {
      id: 10600044,
      amount: "1",
      cost: "3",
      desc: "card_desc_10600044",
      name: "card_name_10600044",
      img_url: "https://patchwiki.biligame.com/images/resonance/6/65/p775m9fv0bakvr0hkzsmd23o08i96h2.png",
    },
    "10600270": {
      id: 10600270,
      amount: "1",
      cost: "4",
      desc: "card_desc_10600270",
      name: "card_name_10600270",
      img_url: "https://patchwiki.biligame.com/images/resonance/8/82/fsgbawbdejfqb0r5eeaadi676lyr53c.png",
    },
  },
  equipment: {
    eq00001: {
      id: "eq00001",
      name: "eqmt_name_eq00001",
      url: "https://patchwiki.biligame.com/images/resonance/8/82/fsgbawbdejfqb0r5eeaadi676lyr53c.png",
      rarity: "UR",
      desc: "eqmt_desc_eq00001",
      type: "acc",
    },
    eq00002: {
      id: "eq00002",
      name: "eqmt_name_eq00002",
      url: "https://patchwiki.biligame.com/images/resonance/thumb/e/ee/fq0fep0m7gviwrodzkw2e9ob2vagiyx.png/180px-%E4%BC%AA%E7%A5%9E%E4%BD%8E%E8%AF%AD.png",
      rarity: "UR",
      desc: "eqmt_desc_eq00002",
      type: "armor",
    },
    eq00003: {
      id: "eq00003",
      name: "eqmt_name_eq00003",
      url: "https://nng-phinf.pstatic.net/MjAyNTAyMDhfMjE4/MDAxNzM5MDAzMDQ4Njgy.wz7wbNvBL8FzGmZ0CaW7NjxuJNylruigHENvgj0SCmUg.w7WhK-CicD2skUmH2howWXyhm77yVYMs7LoJrzg0eIsg.PNG/%E7%A9%BA%E9%97%B4%E5%88%87%E7%BA%BF.png",
      rarity: "UR",
      desc: "eqmt_desc_eq00003",
      type: "weapon",
    },
    eq00004: {
      id: "eq00004",
      name: "eqmt_name_eq00004",
      url: "https://patchwiki.biligame.com/images/resonance/6/65/p775m9fv0bakvr0hkzsmd23o08i96h2.png",
      rarity: "SSR",
      desc: "eqmt_desc_eq00004",
      type: "weapon",
    },
    eq00005: {
      id: "eq00005",
      name: "eqmt_name_eq00005",
      url: "https://patchwiki.biligame.com/images/resonance/c/c0/ttk4iasqbm7ua9t5grid0ntz66l6klv.png",
      rarity: "SR",
      desc: "eqmt_desc_eq00005",
      type: "armor",
    },
    eq00006: {
      id: "eq00006",
      name: "eqmt_name_eq00006",
      url: "https://patchwiki.biligame.com/images/resonance/5/5f/fove629a7cnqli99apcr5nfpfm9uz22.png",
      rarity: "R",
      desc: "eqmt_desc_eq00006",
      type: "acc",
    },
  },
  extraInfo: {
    specialCtrlIcon: {
      "0": {
        text: "specialCtrl_00",
        icon: "<=",
        minimum: "0",
        maximum: "11",
      },
      "1": {
        text: "specialCtrl_00",
        icon: ">",
        minimum: "0",
        maximum: "11",
      },
      "2": {
        text: "specialCtrl_00",
        icon: "<",
        minimum: "0",
        maximum: "11",
      },
      "3": {
        text: "specialCtrl_00",
        icon: ">=",
        minimum: "0",
        maximum: "11",
      },
      "4": {
        text: "specialCtrl_00",
        icon: "<",
        minimum: "0",
        maximum: "11",
      },
      "5": {
        text: "specialCtrl_05",
      },
      "6": {
        text: "specialCtrl_06",
      },
      "7": {
        text: "specialCtrl_07",
      },
    },
  },
  languages: {
    ko: {
      specialCtrl_00: "손패 수",
      specialCtrl_01: "손패수",
      specialCtrl_02: "현재 사용 가능한 비용",
      specialCtrl_03: "현재 사용 가능한 비용",
      specialCtrl_04: "파티원체력",
      specialCtrl_05: "체력이 낮은 아군을 상대로 시전",
      specialCtrl_06: "자신을 상대로 시전",
      specialCtrl_07: "무작위 적을 상대로 시전",
      char_name_10000025: "줄리안",
      char_desc_10000025: "설명을 입력해주세요",
      char_name_10000027: "하루카",
      char_desc_10000027: "설명을 입력해주세요",
      char_name_10000031: "조슈아",
      char_desc_10000031: "설명을 입력해주세요",
      char_name_10000032: "니콜라",
      char_desc_10000032: "설명을 입력해주세요",
      char_name_10000047: "발렌타인",
      char_desc_10000047: "설명을 입력해주세요",
      card_name_10600014: "기본 공격",
      card_desc_10600014: "적에게 물리 피해를 줍니다",
      card_name_10600015: "방어 태세",
      card_desc_10600015: "방어력을 증가시킵니다",
      card_name_10600016: "필살기",
      card_desc_10600016: "모든 적에게 강력한 피해를 줍니다",
      card_name_10600017: "화염 화살",
      card_desc_10600017: "적에게 화염 피해를 줍니다",
      card_name_10600018: "회복 주문",
      card_desc_10600018: "아군의 체력을 회복시킵니다",
      card_name_10600019: "화염 폭발",
      card_desc_10600019: "모든 적에게 화염 피해를 줍니다",
      card_name_10600262: "다크 아트",
      card_desc_10600262: "적에게 마법 피해를 줍니다",
      card_name_10600263: "암흑 보호막",
      card_desc_10600263: "아군에게 보호막을 부여합니다",
      card_name_10600264: "암흑 폭발",
      card_desc_10600264: "모든 적에게 암흑 피해를 줍니다",
      card_name_10600075: "화염 신성",
      card_desc_10600075: "적에게 화염 피해를 줍니다",
      card_name_10600076: "신성한 보호",
      card_desc_10600076: "아군에게 신성한 보호를 부여합니다",
      card_name_10600077: "신성한 심판",
      card_desc_10600077: "모든 적에게 신성한 피해를 줍니다",
      card_name_10600044: "원소핵불",
      card_desc_10600044: "적에게 화염 피해를 줍니다",
      card_name_10600270: "기이한불꽃",
      card_desc_10600270: "적에게 화염 피해를 줍니다",
      eqmt_name_eq00001: "신비한 장신구",
      eqmt_desc_eq00001: "마법 공격력을 증가시킵니다",
      eqmt_name_eq00002: "고대의 유물",
      eqmt_desc_eq00002: "체력을 회복시킵니다",
      eqmt_name_eq00003: "공간 절단기",
      eqmt_desc_eq00003: "물리 공격력을 증가시킵니다",
      eqmt_name_eq00004: "빛나는 검",
      eqmt_desc_eq00004: "물리 공격력을 증가시킵니다",
      eqmt_name_eq00005: "강화된 갑옷",
      eqmt_desc_eq00005: "방어력을 증가시킵니다",
      eqmt_name_eq00006: "행운의 부적",
      eqmt_desc_eq00006: "회피율을 증가시킵니다",
    },
    en: {
      specialCtrl_00: "Hand Cards",
      specialCtrl_01: "Hand Cards",
      specialCtrl_02: "Available Cost",
      specialCtrl_03: "Available Cost",
      specialCtrl_04: "Party HP",
      specialCtrl_05: "Cast on ally with lowest HP",
      specialCtrl_06: "Cast on self",
      specialCtrl_07: "Cast on random enemy",
      char_name_10000025: "Julian",
      char_desc_10000025: "Please enter description",
      char_name_10000027: "Haruka",
      char_desc_10000027: "Please enter description",
      char_name_10000031: "Joshua",
      char_desc_10000031: "Please enter description",
      char_name_10000032: "Nicola",
      char_desc_10000032: "Please enter description",
      char_name_10000047: "Valentine",
      char_desc_10000047: "Please enter description",
      card_name_10600014: "Basic Attack",
      card_desc_10600014: "Deal physical damage to enemy",
      card_name_10600015: "Defensive Stance",
      card_desc_10600015: "Increase defense",
      card_name_10600016: "Ultimate",
      card_desc_10600016: "Deal powerful damage to all enemies",
      card_name_10600017: "Fire Arrow",
      card_desc_10600017: "Deal fire damage to enemy",
      card_name_10600018: "Healing Spell",
      card_desc_10600018: "Restore health to ally",
      card_name_10600019: "Fire Explosion",
      card_desc_10600019: "Deal fire damage to all enemies",
      card_name_10600262: "Dark Arts",
      card_desc_10600262: "Deal magic damage to enemy",
      card_name_10600263: "Dark Shield",
      card_desc_10600263: "Apply shield to ally",
      card_name_10600264: "Dark Explosion",
      card_desc_10600264: "Deal dark damage to all enemies",
      card_name_10600075: "Flame Divine",
      card_desc_10600075: "Deal fire damage to enemy",
      card_name_10600076: "Divine Protection",
      card_desc_10600076: "Apply divine protection to ally",
      card_name_10600077: "Divine Judgment",
      card_desc_10600077: "Deal divine damage to all enemies",
      card_name_10600044: "Elemental Fire",
      card_desc_10600044: "Deal fire damage to enemy",
      card_name_10600270: "Strange Flame",
      card_desc_10600270: "Deal fire damage to enemy",
      eqmt_name_eq00001: "Mystic Accessory",
      eqmt_desc_eq00001: "Increases magic attack",
      eqmt_name_eq00002: "Ancient Relic",
      eqmt_desc_eq00002: "Restores health",
      eqmt_name_eq00003: "Space Cutter",
      eqmt_desc_eq00003: "Increases physical attack",
      eqmt_name_eq00004: "Shining Sword",
      eqmt_desc_eq00004: "Increases physical attack",
      eqmt_name_eq00005: "Reinforced Armor",
      eqmt_desc_eq00005: "Increases defense",
      eqmt_name_eq00006: "Lucky Charm",
      eqmt_desc_eq00006: "Increases evasion rate",
    },
  },
}

export const dummyPreset: Preset = {
  roleList: [10000025, -1, -1, 10000031, -1],
  header: 10000025,
  cardList: [
    {
      id: "10600262",
      useType: 1,
      useParam: -1,
    },
  ],
  isLeaderCardOn: true,
  isSpCardOn: true,
  keepCardNum: 0,
  discardType: 0,
  otherCard: 0,
}

