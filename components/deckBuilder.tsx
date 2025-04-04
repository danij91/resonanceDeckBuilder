"use client"

import { useState, useEffect } from "react"
import { TopBar } from "./top-bar"
import { CharacterWindow } from "./character-window"
import { SkillWindow } from "./skill-window"
import { BattleSettings } from "./battle-settings"
import { useDeckBuilder } from "../hooks/use-deck-builder"
import { useDataLoader } from "../hooks/use-data-loader"
import { LoadingScreen } from "./loading-screen"
import { Toast } from "./toast-notification"
import { copyToClipboard } from "../utils/clipboard"
import { CommentsSection } from "./comments-section"
import { useLanguage } from "../contexts/language-context"

interface DeckBuilderProps {
  urlDeckCode?: string | null
}

export default function DeckBuilder({ urlDeckCode }: DeckBuilderProps) {
  const { data, loading, error } = useDataLoader()
  const { currentLanguage, getTranslatedString } = useLanguage()

  const {
    selectedCharacters,
    leaderCharacter,
    selectedCards,
    battleSettings,
    equipment,
    isDarkMode,
    availableCards,
    getCharacter,
    getCardInfo,
    getEquipment,
    getSkill,
    allEquipments,
    addCharacter,
    removeCharacter,
    setLeader,
    addCard,
    removeCard,
    reorderCards,
    updateCardSettings,
    updateBattleSettings,
    updateEquipment,
    toggleDarkMode,
    clearAll,
    exportPreset,
    exportPresetToString,
    importPreset,
    importPresetObject,
    createShareableUrl,
    createRootShareableUrl,
    decodePresetString,
  } = useDeckBuilder(data)

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  // Load deck from URL on mount
  useEffect(() => {
    if (urlDeckCode && data) {
      const preset = decodePresetString(urlDeckCode)
      if (preset) {
        const importResult = importPresetObject(preset)
        if (importResult.success) {
          showToast(getTranslatedString(importResult.message) || "Import successful!", "success")
        } else {
          showToast(getTranslatedString(importResult.message) || "Import failed!", "error")
        }
      } else {
        showToast(getTranslatedString("import_failed") || "Import failed!", "error")
      }
    }
  }, [urlDeckCode, data, decodePresetString, importPresetObject, getTranslatedString])

  // Show toast message
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  // Show alert popup
  const showAlert = (message: string) => {
    alert(message)
  }

  // Clear all settings
  const handleClear = () => {
    clearAll()
    // alert 대신 toast 메시지 사용
    showToast(getTranslatedString("deck_cleared") || "Deck cleared!", "info")
  }

  // Import from clipboard
  const handleImport = async () => {
    try {
      const importResult = await importPreset()
      if (importResult.success) {
        // alert 대신 toast 메시지 사용
        showToast(getTranslatedString(importResult.message) || "Deck imported successfully!", "success")
      } else {
        showToast(getTranslatedString(importResult.message) || "Import failed!", "error")
      }
    } catch (e) {
      showToast(getTranslatedString("import_failed") || "Import failed!", "error")
    }
  }

  // Export to clipboard
  const handleExport = async () => {
    try {
      const exportResult = exportPreset()
      if (exportResult.success) {
        // 성공 시 알림 팝업 표시
        showAlert(getTranslatedString(exportResult.message) || "Deck exported to clipboard successfully!")
      } else {
        showToast(getTranslatedString(exportResult.message) || "Export failed!", "error")
      }
    } catch (e) {
      showToast(getTranslatedString("export_failed") || "Export failed!", "error")
    }
  }

  // Share deck
  const handleShare = async () => {
    try {
      const shareableUrlResult = createShareableUrl()
      if (shareableUrlResult.success) {
        await copyToClipboard(shareableUrlResult.url)
        // 성공 시 알림 팝업 표시
        showAlert(
          getTranslatedString("share_link_copied_alert") ||
            "Share link copied to clipboard!\n\nYou can now paste and share it.",
        )
      } else {
        showToast(getTranslatedString("share_link_failed") || "Failed to create share link!", "error")
      }
    } catch (e) {
      showToast(getTranslatedString("share_link_failed") || "Failed to create share link!", "error")
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading data..." />
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message}
        <br />
        Please check console for more details.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <TopBar onClear={handleClear} onImport={handleImport} onExport={handleExport} onShare={handleShare} />

      <div className="container mx-auto px-4 pt-28 pb-8">
        <CharacterWindow
          selectedCharacters={selectedCharacters}
          leaderCharacter={leaderCharacter}
          onAddCharacter={addCharacter}
          onRemoveCharacter={removeCharacter}
          onSetLeader={setLeader}
          getCharacter={getCharacter}
          getTranslatedString={getTranslatedString}
          availableCharacters={Object.values(data.characters)}
          equipment={equipment}
          onEquipItem={updateEquipment}
          getCardInfo={getCardInfo}
          getEquipment={getEquipment}
          equipments={allEquipments}
          data={data}
          getSkill={getSkill}
        />

        <SkillWindow
          selectedCards={selectedCards}
          availableCards={availableCards.map((item) => {
            const card = item.card
            const cardId = card.id.toString()

            // 카드 추가 정보 가져오기
            const extraInfo = {
              name: card.name,
              desc: card.name,
              cost: 0, // 기본값 0으로 설정
              amount: 1,
              img_url: null as string | null,
            }

            // 스킬 ID 찾기
            let skillId = null
            for (const sId in data.skills) {
              const skill = data.skills[sId]
              if (skill.cardID && skill.cardID.toString() === cardId) {
                skillId = sId
                break
              }
            }

            // card_db.json에서 cost_SN 값 가져오기
            if (card.cost_SN !== undefined) {
              // cost_SN을 10000으로 나누기
              const costValue = card.cost_SN > 0 ? Math.floor(card.cost_SN / 10000) : 0
              extraInfo.cost = costValue
            }

            // 이미지 URL 찾기
            if (data && data.images) {
              // 카드 ID로 이미지 찾기
              if (data.images[`card_${cardId}`]) {
                extraInfo.img_url = data.images[`card_${cardId}`]
              }

              // 스킬 ID로 이미지 찾기
              if (skillId && data.images[`skill_${skillId}`]) {
                extraInfo.img_url = data.images[`skill_${skillId}`]
              }
            }

            // 캐릭터 이미지 연결 개선
            let characterImage = null

            // 1. 카드의 ownerId로 캐릭터 찾기
            if (card.ownerId) {
              const owner = getCharacter(card.ownerId)
              if (owner && owner.img_card) {
                characterImage = owner.img_card
              }
            }

            // 2. 스킬을 통해 캐릭터 찾기 (ownerId가 없거나 이미지를 찾지 못한 경우)
            if (!characterImage && skillId) {
              // 이 스킬을 가진 캐릭터 찾기
              for (const charId in data.characters) {
                const character = data.characters[charId]
                if (character.skillList) {
                  const hasSkill = character.skillList.some((s) => s.skillId.toString() === skillId)
                  if (hasSkill && character.img_card) {
                    characterImage = character.img_card
                    break
                  }
                }
              }
            }

            // 3. 여전히 이미지가 없으면 실제 placeholder 이미지 사용
            if (!characterImage) {
              // 주인이 없는 카드는 기본 placeholder 이미지 사용
              characterImage = "images/placeHolder Card.jpg/?height=200&width=200"

              // 카드 이미지도 placeholder로 설정
              if (!extraInfo.img_url) {
                extraInfo.img_url = "/placeholder.svg?height=100&width=100"
              }
            }

            return {
              card: card,
              extraInfo: extraInfo,
              characterImage: characterImage,
            }
          })}
          onAddCard={addCard}
          onRemoveCard={removeCard}
          onReorderCards={reorderCards}
          onUpdateCardSettings={updateCardSettings}
          getTranslatedString={getTranslatedString}
          specialControls={{}}
        />

        <BattleSettings
          settings={battleSettings}
          onUpdateSettings={updateBattleSettings}
          getTranslatedString={getTranslatedString}
        />
      </div>
      <CommentsSection currentLanguage={currentLanguage} />
    </div>
  )
}

