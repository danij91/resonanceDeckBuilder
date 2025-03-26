import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real app, this would come from a database
    // For this example, we'll use a static JSON object
    const cardTexts = {
      "10600367": {
        name: "계시",
        description:
          "모든 비용을 소모하고,소모한 비용만큼 무작위 적에게 2단 피해를 입힙니다. 1단 피해를 입힐 때마다 10% 확률로 [다크 아트]를 1장 생성하여 손으로 가져옵니다. 소모한 비용이 많을수록 피해가 높습니다. 손에서 내면 [소각]됩니다. 이 카드가 버려지면 [다크 아트]를 1장 생성하여 손으로 가져옵니다.",
      },
      "10600262": {
        name: "다크 아트",
        description:
          "금지의 비술을 사용하여 적에게 1단 피해를 입히고 [중상]을 부여합니다. 동시에 [저주]를 발동합니다. 손에서 내면 [소각]됩니다. 특수 효과 [다키스트 아워] 이 카드를 누적 13장 사용 시 피의 마신을 소환하여 모든 적에게 1단의 파멸적인 피해를 입힙니다. 적이 기계형이라면 피해가 절반으로 감소합니다.",
      },
      "10600279": {
        name: "부채술",
        description: "부채를 흔들어 앞열 아군의 공격력을 2% 증가시킵니다(중첩 가능)",
      },
      "10600351": {
        name: "구축의 화염",
        description:
          "범위 내의 적에게 1단 피해를 입히고 [족쇄]와 [속박]을 부여합니다. 동시에 매초 [점화]를 1회 발동합니다.(6초간 지속) 사용 후 [소각]됩니다.",
      },
      "10600189": {
        name: "방열",
        description:
          "방열시켜 모든 적에게 점화 효과를 부여하며 적군 필드에 광염 효과를 발동시킵니다. 동시에 1장의 블랙카드 음에너지를 생성하여 덱에 추가합니다. 사용 후 방열은 흡수로 전환됩니다.",
      },
      "10600353": {
        name: "미스터리",
        description:
          "[해체의 상자]를 활성화하여 손에 있는 모든 카드를 덱으로 섞어넣은 후 카드를 3장 뽑습니다. 뽑은 레드카드의 수만큼 [구축의 화염]을 생성하여 손으로 가져옵니다. 뽑은 옐로카드의 수만큼 [해체의 번개]를 생성하여 손으로 가져옵니다. 뽑은 블루카드의 수만큼 [재구축의 힘]을 생성하여 손으로 가져옵니다. 뽑은 그린카드의 수만큼 [음에너지]를 생성하여 손으로 가져옵니다.",
      },
    }

    return NextResponse.json(cardTexts)
  } catch (error) {
    console.error("Error loading card texts:", error)
    return NextResponse.json({ error: "Failed to load card texts" }, { status: 500 })
  }
}

