"use client"

import { useEffect, useMemo } from "react"
import { useDataLoader } from "../hooks/use-data-loader"
import { useDeckBuilder } from "../hooks/use-deck-builder"
import { TopBar } from "./top-bar"
import { CharacterWindow } from "./character-window"
import { BattleSettings } from "./battle-settings"
import { useToast } from "./toast-notification"
import type { Character } from "../types"
import { SkillWindow } from "./skill-window"
import type { Equipment } from "../types"
import { LoadingScreen } from "./loading-screen"

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
              "success",
            )
          } else {
            showToast(deckBuilder.getTranslatedString("import_failed") || "Failed to load deck from URL", "error")
          }
        }
      } catch (error) {
        console.error("Failed to load deck from URL:", error)
        showToast(deckBuilder.getTranslatedString("import_failed") || "Failed to load deck from URL", "error")
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

  // 장비 목록 가져오기
  const availableEquipments = useMemo<Equipment[]>(() => {
    if (!data || !data.equipments) return []
    return Object.values(data.equipments)
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <LoadingScreen message={deckBuilder.getTranslatedString("loading") || "Loading..."} />
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
            getCardInfo={deckBuilder.getCardInfo}
            getEquipment={deckBuilder.getEquipment}
            equipments={availableEquipments}
            data={data}
            getSkill={deckBuilder.getSkill}
          />

          <SkillWindow
            selectedCards={deckBuilder.selectedCards}
            availableCards={deckBuilder.availableCards.map(({ card }) => {
              // 카드 정보 가져오기
              const extraInfo = {
                name: card.name,
                desc: card.name, // 실제로는 카드 설명이 필요합니다
                cost: card.cost_SN ? Math.floor(card.cost_SN / 10000) : 0, // cost_SN을 10000으로 나눈 정수값
                amount: 1, // 기본값
                img_url: null, // 기본값은 null로 설정
                specialCtrl: card.ExCondList?.map((cond) => cond.condId?.toString()) || [],
              }

              // 카드 이미지 URL 찾기
              // 1. 먼저 card_id로 찾기
              if (data.images[`card_${card.id}`]) {
                extraInfo.img_url = data.images[`card_${card.id}`]
              } else {
                // 2. 스킬 ID로 찾기
                // 카드에 해당하는 스킬 찾기
                for (const skillId in data.skills) {
                  const skill = data.skills[skillId]
                  if (skill.cardID && skill.cardID.toString() === card.id.toString()) {
                    // skill_id 형식으로 이미지 찾기
                    if (data.images[`skill_${skillId}`]) {
                      extraInfo.img_url = data.images[`skill_${skillId}`]
                      break
                    }
                  }
                }
              }

              // 이미지가 없으면 캐릭터 이미지 사용
              let characterImage
              if (card.ownerId) {
                const character = data.characters[card.ownerId.toString()]
                if (character && character.img_card) {
                  characterImage = character.img_card
                }
              }

              return { card, extraInfo, characterImage }
            })}
            onAddCard={deckBuilder.addCard}
            onRemoveCard={deckBuilder.removeCard}
            onReorderCards={deckBuilder.reorderCards}
            onUpdateCardSettings={deckBuilder.updateCardSettings}
            getTranslatedString={deckBuilder.getTranslatedString}
            specialControls={{
              "0": { text: "HP 50% 이하", icon: "<=", minimum: "0", maximum: "100" },
              "1": { text: "HP 70% 이상", icon: ">=", minimum: "0", maximum: "100" },
            }}
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

