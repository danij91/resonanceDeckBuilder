'use client'

import { useEffect, useMemo } from "react"
import { useDataLoader } from "../hooks/use-data-loader"
import { useDeckBuilder } from "../hooks/use-deck-builder"
import { TopBar } from "./top-bar"
import { CharacterWindow } from "./character-window"
import { SkillWindow } from "./skill-window"
import { BattleSettings } from "./battle-settings"
import { useToast } from "./toast-notification"
import type { Character } from "../types"

interface DeckBuilderProps {
  lang: string
}

export default function DeckBuilder({ lang }: DeckBuilderProps) {
  const { data, loading, error } = useDataLoader()
  const deckBuilder = useDeckBuilder(data)
  const { showToast, ToastContainer } = useToast()

  // 초기 언어 설정
  useEffect(() => {
    if (lang) {
      deckBuilder.setLanguage(lang)
    }
  }, [lang, deckBuilder])

  // Get all available characters
  const availableCharacters = useMemo<Character[]>(() => {
    if (!data) return []
    return Object.values(data.characters)
  }, [data])

  // Get available languages
  const availableLanguages = useMemo(() => {
    if (!data) return ["en"]
    return Object.keys(data.languages)
  }, [data])

  // Get character images for skill cards
  const availableCardsWithImages = useMemo(() => {
    if (!deckBuilder.availableCards.length || !data) return []

    return deckBuilder.availableCards.map((cardInfo) => {
      const ownerCharacter = data.characters[cardInfo.card.ownerId.toString()]
      return {
        ...cardInfo,
        characterImage: ownerCharacter?.img_card,
      }
    })
  }, [deckBuilder.availableCards, data])

  // Load deck from URL if deckCode parameter is present
  useEffect(() => {
    const loadDeckFromUrl = async () => {
      if (!data) return

      try {
        const params = new URLSearchParams(window.location.search)
        const deckCode = params.get("deckCode")

        if (deckCode) {
          const originalClipboard = navigator.clipboard.readText
          navigator.clipboard.readText = async () => deckCode

          const result = await deckBuilder.importPreset()

          navigator.clipboard.readText = originalClipboard

          if (result.success) {
            showToast(
              deckBuilder.getTranslatedString("import_success") || "Deck loaded from URL successfully!",
              "success"
            )
          } else {
            showToast(
              deckBuilder.getTranslatedString("import_failed") || "Failed to load deck from URL",
              "error"
            )
          }
        }
      } catch (error) {
        console.error("Failed to load deck from URL:", error)
        showToast(
          deckBuilder.getTranslatedString("import_failed") || "Failed to load deck from URL",
          "error"
        )
      }
    }

    loadDeckFromUrl()
  }, [data, deckBuilder, showToast])

  const handleExport = () => {
    const result = deckBuilder.exportPreset()
    showToast(result.message, result.success ? "success" : "error")
  }

  const handleImport = async () => {
    const result = await deckBuilder.importPreset()
    showToast(result.message, result.success ? "success" : "error")
  }

  const handleClear = () => {
    deckBuilder.clearAll()
    showToast(deckBuilder.getTranslatedString("clear_success") || "All settings cleared!", "info")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-xl text-red-500">Error: {error.message}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-xl">No data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark bg-gray-900 text-white">
      <TopBar
        onClear={handleClear}
        onImport={handleImport}
        onExport={handleExport}
        currentLanguage={deckBuilder.language}
        availableLanguages={availableLanguages}
        onChangeLanguage={deckBuilder.setLanguage}
        getTranslatedString={deckBuilder.getTranslatedString}
      />

      <div className="container mx-auto px-2 sm:px-4 max-w-full lg:max-w-6xl pt-24">
        <main>
          <CharacterWindow
            selectedCharacters={deckBuilder.selectedCharacters}
            leaderCharacter={deckBuilder.leaderCharacter}
            onAddCharacter={deckBuilder.addCharacter}
            onRemoveCharacter={deckBuilder.removeCharacter}
            onSetLeader={deckBuilder.setLeader}
            getCharacter={deckBuilder.getCharacter}
            getTranslatedString={deckBuilder.getTranslatedString}
            availableCharacters={availableCharacters}
            equipment={deckBuilder.equipment}
            onEquipItem={deckBuilder.updateEquipment}
            getEquipment={deckBuilder.getEquipment}
            getCardInfo={deckBuilder.getCardInfo}
            data={data}
          />

          <SkillWindow
            selectedCards={deckBuilder.selectedCards}
            availableCards={availableCardsWithImages}
            onAddCard={deckBuilder.addCard}
            onRemoveCard={deckBuilder.removeCard}
            onReorderCards={deckBuilder.reorderCards}
            onUpdateCardSettings={deckBuilder.updateCardSettings}
            getTranslatedString={deckBuilder.getTranslatedString}
            specialControls={data.extraInfo.specialCtrlIcon}
          />

          <BattleSettings
            settings={deckBuilder.battleSettings}
            onUpdateSettings={deckBuilder.updateBattleSettings}
            getTranslatedString={deckBuilder.getTranslatedString}
          />
        </main>

        <ToastContainer />
      </div>
      <div className="container mx-auto px-2 sm:px-4 max-w-full lg:max-w-6xl pt-24 pb-24"></div>
    </div>
  )
}
