"use client"

import { useEffect, useState } from "react"
import type { Database } from "../types"
import { dummyData } from "../dummy"

// Flag to control data source
const USE_DUMMY = false

export function useDataLoader() {
  const [data, setData] = useState<Database | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        if (USE_DUMMY) {
          // Use dummy data for v0 environment
          setData(dummyData)
        } else {
          // Load real data from /db/ folder
          const [
            charactersResponse,
            cardsResponse,
            cardExtraInfoResponse,
            equipmentResponse,
            extraInfoResponse,
            languagesResponse,
          ] = await Promise.all([
            fetch("/db/char_db.json"),
            fetch("/db/card_db.json"),
            fetch("/db/card_extra_info.json"),
            fetch("/db/eqmt_db.json"),
            fetch("/db/extra_info.json"),
            fetch("/db/lang.json"),
          ])

          const [characters, cards, cardExtraInfo, equipment, extraInfo, languages] = await Promise.all([
            charactersResponse.json(),
            cardsResponse.json(),
            cardExtraInfoResponse.json(),
            equipmentResponse.json(),
            extraInfoResponse.json(),
            languagesResponse.json(),
          ])

          setData({
            characters,
            cards,
            cardExtraInfo,
            equipment,
            extraInfo,
            languages,
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

