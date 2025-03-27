import type { Database } from "../types"

/**
 * Loads real data from JSON files
 */
export async function loadRealData(): Promise<Database> {
  try {
    const [
      charactersResponse,
      cardsResponse,
      cardExtraInfoResponse,
      producersResponse,
      equipmentResponse,
      extraInfoResponse,
      languagesResponse,
    ] = await Promise.all([
      fetch("/db/char_db.json"),
      fetch("/db/card_db.json"),
      fetch("/db/card_extra_info.json"),
      fetch("/db/producer_db.json"),
      fetch("/db/eqmt_db.json"),
      fetch("/db/extra_info.json"),
      fetch("/db/lang.json"),
    ])

    const [characters, cards, cardExtraInfo, producers, equipment, extraInfo, languages] = await Promise.all([
      charactersResponse.json(),
      cardsResponse.json(),
      cardExtraInfoResponse.json(),
      producersResponse.json(),
      equipmentResponse.json(),
      extraInfoResponse.json(),
      languagesResponse.json(),
    ])

    return {
      characters,
      cards,
      cardExtraInfo,
      producers,
      equipment,
      extraInfo,
      languages,
    }
  } catch (error) {
    console.error("Error loading real data:", error)
    throw new Error("Failed to load game data")
  }
}

