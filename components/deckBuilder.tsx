"use client"

import { useEffect, useMemo, useRef } from "react"
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
import { decodePresetFromUrlParam } from "../utils/presetCodec"

interface DeckBuilderProps {
  lang: string
  urlDeckCode?: string | null
}

export default function DeckBuilder({ lang, urlDeckCode }: DeckBuilderProps) {
  const { data, loading, error } = useDataLoader()
  const deckBuilder = useDeckBuilder(data)
  const { showToast, ToastContainer } = useToast()

  // useRef를 컴포넌트 최상위 레벨로 이동
  const hasLoadedRef = useRef(false)

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

  // URL에서 덱 코드 로드
  useEffect(() => {
    const loadDeckFromUrl = async () => {
      if (!data || !urlDeckCode || hasLoadedRef.current) return

      try {
        // 로드 상태 표시
        hasLoadedRef.current = true

        // URL에서 가져온 덱 코드 디코딩
        const preset = decodePresetFromUrlParam(urlDeckCode)

        if (preset) {
          // 디코딩된 프리셋 적용
          deckBuilder.importPresetObject(preset)
          showToast(
            deckBuilder.getTranslatedString("import_success") || "Deck loaded from URL successfully!",
            "success",
          )
        } else {
          showToast(deckBuilder.getTranslatedString("import_failed") || "Failed to load deck from URL", "error")
        }
      } catch (error) {
        showToast(deckBuilder.getTranslatedString("import_failed") || "Failed to load deck from URL", "error")
      }
    }

    loadDeckFromUrl()
  }, [data, urlDeckCode, showToast, deckBuilder])

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

  // 공유 기능 추가
  const handleShare = () => {
    const result = deckBuilder.createRootShareableUrl()
    if (result.success) {
      navigator.clipboard.writeText(result.url)
      showToast(deckBuilder.getTranslatedString("share_success") || "Share link copied to clipboard!", "success")
    } else {
      showToast(deckBuilder.getTranslatedString("share_failed") || "Failed to create share link", "error")
    }
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
    <div className="min-h-screen dark bg-black text-white">
      <TopBar
        onClear={handleClear}
        onImport={handleImport}
        onExport={handleExport}
        onShare={handleShare}
        currentLanguage={deckBuilder.language}
        availableLanguages={availableLanguages}
        onChangeLanguage={deckBuilder.setLanguage}
        getTranslatedString={deckBuilder.getTranslatedString}
      />

      <div className="container mx-auto px-2 sm:px-4 max-w-full lg:max-w-6xl pt-24">
        <main>
          <h2 className="neon-section-title">
            {deckBuilder.getTranslatedString("character.section.title") || "Characters"}
          </h2>
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
            availableCards={deckBuilder.selectedCards
              .map((selectedCard) => {
                // 카드 정보 가져오기
                const card = data.cards[selectedCard.id]
                if (!card) return null

                const extraInfo = {
                  name: card.name,
                  desc: "", // 기본값은 빈 문자열
                  cost: card.cost_SN ? Math.floor(card.cost_SN / 10000) : 1, // cost_SN을 10000으로 나눈 정수값
                  amount: 1, // 기본값
                  img_url: null, // 기본값은 null로 설정
                  specialCtrl: card.ExCondList?.map((cond) => cond.condId?.toString()) || [],
                }

                // 카드 이미지 URL 찾기
                // 1. 먼저 card_id로 찾기
                if (data.images[`card_${card.id}`]) {
                  extraInfo.img_url = data.images[`card_${card.id}`]
                } else {
                  // 2. 임포트된 카드 정보에서 skillId 확인 (새로운 방식)
                  const importedCardInfo = deckBuilder.selectedCards.find((c) => c.id === card.id.toString())
                  if (importedCardInfo && importedCardInfo.skillId) {
                    // skillId로 직접 이미지 찾기
                    if (data.images[`skill_${importedCardInfo.skillId}`]) {
                      extraInfo.img_url = data.images[`skill_${importedCardInfo.skillId}`]
                      // 스킬 설명 키 설정
                      extraInfo.desc = `skill_description_${importedCardInfo.skillId}`
                    }
                  }

                  // 3. 위 방법으로 찾지 못한 경우 기존 방식으로 시도 (fallback)
                  if (!extraInfo.img_url) {
                    // 카드에 해당하는 스킬 찾기
                    for (const skillId in data.skills) {
                      const skill = data.skills[skillId]
                      if (skill.cardID && skill.cardID.toString() === card.id.toString()) {
                        // skill_id 형식으로 이미지 찾기
                        if (data.images[`skill_${skillId}`]) {
                          extraInfo.img_url = data.images[`skill_${skillId}`]
                        }

                        // 스킬 설명 키 설정
                        extraInfo.desc = `skill_description_${skillId}`
                        break
                      }
                    }
                  }
                }

                // 캐릭터 이미지 찾기
                let characterImage = null

                // 1. 카드의 ownerId 확인
                let ownerId = card.ownerId

                // 2. 임포트된 데이터에서 ownerId 확인 (임포트된 카드에 ownerId가 있는 경우)
                // 임포트된 카드 정보에서 ownerId 찾기
                const importedCardInfo = deckBuilder.selectedCards.find((c) => c.id === card.id.toString())
                if (importedCardInfo && importedCardInfo.ownerId) {
                  ownerId = importedCardInfo.ownerId
                }

                // 3. ownerId로 캐릭터 이미지 찾기
                if (ownerId) {
                  const character = data.characters[ownerId.toString()]
                  if (character && character.img_card) {
                    characterImage = character.img_card
                  }
                }

                return { card, extraInfo, characterImage }
              })
              .filter(Boolean)}
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

