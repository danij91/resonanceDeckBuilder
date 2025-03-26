import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real app, this would come from a database
    // For this example, we'll use a static JSON object
    const characterDB = {
      "10000072": {
        rarity: "SSR",
        skills: {
          skill1: "",
          skill2: "",
          ultimate: "",
        },
        img_card: "https://patchwiki.biligame.com/images/resonance/0/00/js1l3c6ehy556lhpbvpmbxwkc3sbldp.png",
      },
      "10000352": {
        rarity: "SSR",
        skills: {
          skill1: "",
          skill2: "",
          ultimate: "",
        },
        img_card: "https://patchwiki.biligame.com/images/resonance/a/a3/6j4kheodb9w0wd4hfkqh1zkt72m6lih.png",
      },
      "10000389": {
        rarity: "SR",
        skills: {
          skill1: "",
          skill2: "",
          ultimate: "",
        },
        img_card: "https://patchwiki.biligame.com/images/resonance/9/94/muij3ww15m1vow5rue5sie2wbdud0n7.png",
      },
      "10000071": {
        rarity: "SR",
        skills: {
          skill1: "",
          skill2: "",
          ultimate: "",
        },
        img_card: "https://patchwiki.biligame.com/images/resonance/0/0d/09np973hig1iqxj58563egh13i72df1.png",
      },
      "10000031": {
        rarity: "SSR",
        skills: {
          skill1: "",
          skill2: "",
          ultimate: "",
        },
        img_card: "https://patchwiki.biligame.com/images/resonance/9/9e/jn2p7d9fuxa2b4kijg6vljnsyctac2x.png",
      },
    }

    return NextResponse.json(characterDB)
  } catch (error) {
    console.error("Error loading character database:", error)
    return NextResponse.json({ error: "Failed to load character database" }, { status: 500 })
  }
}

