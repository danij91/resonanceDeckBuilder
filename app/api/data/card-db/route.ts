import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real app, this would come from a database
    // For this example, we'll use a static JSON file
    const cardDB = {
      "10600367": {
        ownerId: "10000031",
        skillId: "12301615",
        cost: 0,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/8/89/k3fcnmv8xm3p19r3l1ry1xy7h9f6gpr.png",
      },
      "10600262": {
        ownerId: "10000031",
        skillId: "12300420",
        cost: 2,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/8/8d/c1bbc3pc35cnz42fctf2jnw20rhnnib.png",
      },
      "10600279": {
        ownerId: "10000071",
        skillId: "12300177",
        cost: 1,
        count: 4,
        img_url: "https://patchwiki.biligame.com/images/resonance/2/25/5wezl2aml202vh725yiuzfgflp5cibw.png",
      },
      "10600351": {
        ownerId: "10000072",
        skillId: "12301494",
        cost: 0,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/f/f3/e5a5fwxz2wrlsxy5a32c47irfe11v0u.png",
      },
      "10600189": {
        ownerId: "10000389",
        skillId: "12300331",
        cost: 0,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/7/7e/50wgshxj0vv0uo8ag1s22mwymgrz6nr.png",
      },
      "10600353": {
        ownerId: "10000072",
        skillId: "12300035",
        cost: 6,
        count: 1,
        img_url: "https://patchwiki.biligame.com/images/resonance/7/7b/m72gnc79bmk2m7bop0p1n04omxuer44.png",
      },
      "10600350": {
        ownerId: "10000072",
        skillId: "12301493",
        cost: 0,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/2/2f/b6xqle4rt07rhjjirer7llb3ajqnmxx.png",
      },
      "10600293": {
        ownerId: "10000031",
        skillId: "12300055",
        cost: 2,
        count: 3,
        img_url: "https://patchwiki.biligame.com/images/resonance/b/b6/r3q8agu5135ph199yhjq5okg2dslav5.png",
      },
      "10600188": {
        ownerId: "10000389",
        skillId: "12300330",
        cost: 2,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/c/cb/9k7jsgcej3fowq10t9cbh8xpdet2uqy.png",
      },
      "10600224": {
        ownerId: "10000352",
        skillId: "12300667",
        cost: 3,
        count: 2,
        img_url: "https://patchwiki.biligame.com/images/resonance/5/55/5w9nbda64d49lgfx9duedgl0j9e6arp.png",
      },
      "10600190": {
        ownerId: "10000389",
        skillId: "12300297",
        cost: 2,
        count: 2,
        img_url: "https://patchwiki.biligame.com/images/resonance/2/2d/ewsmiy1pfieuey3a5abx3p90iikozcv.png",
      },
      "10600294": {
        ownerId: "10000031",
        skillId: "12300072",
        cost: 5,
        count: 1,
        img_url: "https://patchwiki.biligame.com/images/resonance/8/89/k3fcnmv8xm3p19r3l1ry1xy7h9f6gpr.png",
      },
      "10600280": {
        ownerId: "10000071",
        skillId: "12300194",
        cost: 5,
        count: 1,
        img_url: "https://patchwiki.biligame.com/images/resonance/2/25/d91ch3vwdipmnanvgn7h6nwxzjzr7n1.png",
      },
      "10600226": {
        ownerId: "10000352",
        skillId: "12300417",
        cost: 3,
        count: 2,
        img_url: "https://patchwiki.biligame.com/images/resonance/6/6f/r879nqtbk8guze0volssyx5itv5jutv.png",
      },
      "10600223": {
        ownerId: "10000352",
        skillId: "12300419",
        cost: 5,
        count: 1,
        img_url: "https://patchwiki.biligame.com/images/resonance/b/b4/5prwcj9vou568lbeoegtrp1np196leb.png",
      },
      "10600172": {
        ownerId: "10000389",
        skillId: "12300060",
        cost: 2,
        count: 2,
        img_url: "https://patchwiki.biligame.com/images/resonance/5/57/auk2ufurrv9n55oeo0omf896oy80v1g.png",
      },
      "10600349": {
        ownerId: "10000072",
        skillId: "12301492",
        cost: 0,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/a/ac/iff79b580e1ksrjppmqul2ip46qrlka.png",
      },
      "10600284": {
        ownerId: "10000031",
        skillId: "12300056",
        cost: 2,
        count: 2,
        img_url: "https://patchwiki.biligame.com/images/resonance/b/be/gl7we5bw123dsh428nni5o72zhz0gzx.png",
      },
      "10600192": {
        ownerId: "10000031",
        skillId: "12300617",
        cost: 0,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/d/d5/r8z6nut14zi52fnj6qve1iitlp5f5bz.png",
      },
      "10600295": {
        ownerId: "10000072",
        skillId: "12300033",
        cost: 2,
        count: 2,
        img_url: "https://patchwiki.biligame.com/images/resonance/4/4c/4nl0s3objeckrlpt390mt992pkv20jg.png",
      },
      "10600258": {
        ownerId: "10000389",
        skillId: "12300147",
        cost: 5,
        count: 1,
        img_url: "https://patchwiki.biligame.com/images/resonance/6/6d/7luscsslvl69nxrj9m184mnvm1uo4y0.png",
      },
      "10600352": {
        ownerId: "10000072",
        skillId: "12301488",
        cost: 0,
        count: 0,
        img_url: "https://patchwiki.biligame.com/images/resonance/7/7d/ep9qkesclitiq5qr78yul1wp8zyfhji.png",
      },
      "10600296": {
        ownerId: "10000072",
        skillId: "12300034",
        cost: 3,
        count: 1,
        img_url: "https://patchwiki.biligame.com/images/resonance/b/b4/tawsdboaoj7g315b3373zhiy8frwawg.png",
      },
      "10600113": {
        ownerId: "10000071",
        skillId: "12300115",
        cost: 10,
        count: 1,
        img_url: "https://patchwiki.biligame.com/images/resonance/e/e3/t680z5bguufb7qn74g39v2lw11rhtlf.png",
      },
    }

    return NextResponse.json(cardDB)
  } catch (error) {
    console.error("Error loading card database:", error)
    return NextResponse.json({ error: "Failed to load card database" }, { status: 500 })
  }
}

