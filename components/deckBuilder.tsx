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
          showToast(importResult.message, "success")
        } else {
          showToast(importResult.message, "error")
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

  // Clear all settings
  const handleClear = () => {
    clearAll()
    showToast(getTranslatedString("deck_cleared") || "Deck cleared!", "info")
  }

  // Import from clipboard
  const handleImport = async () => {
    try {
      const importResult = await importPreset()
      showToast(importResult.message, importResult.success ? "success" : "error")
    } catch (e) {
      showToast(getTranslatedString("import_failed") || "Import failed!", "error")
    }
  }

  // Export to clipboard
  const handleExport = async () => {
    try {
      const exportResult = exportPreset()
      showToast(exportResult.message, exportResult.success ? "success" : "error")
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
        showToast(getTranslatedString("share_link_copied") || "Share link copied!", "success")
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
              cost: 1,
              amount: 1,
              img_url: null as string | null,
            }

            // 이미지 URL 찾기
            if (data && data.images) {
              // 카드 ID로 이미지 찾기
              if (data.images[`card_${cardId}`]) {
                extraInfo.img_url = data.images[`card_${cardId}`]
              }

              // 스킬 ID로 이미지 찾기
              const skillId = Object.keys(data.skills).find((skillId) => {
                const skill = data.skills[skillId]
                return skill.cardID && skill.cardID.toString() === cardId
              })

              if (skillId && data.images[`skill_${skillId}`]) {
                extraInfo.img_url = data.images[`skill_${skillId}`]
              }
            }

            const owner = getCharacter(card.ownerId || -1)
            return {
              card: card,
              extraInfo: extraInfo,
              characterImage: owner?.img_card,
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

