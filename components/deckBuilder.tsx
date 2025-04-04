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

// Firebase Analytics 관련 import 추가
import { analytics, logEvent } from "../lib/firebase-config"

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

  // 캐릭터 ID를 개별 파라미터로 변환하는 함수
  const createCharacterParams = (characterIds: number[]) => {
    // 유효한 캐릭터만 필터링 (빈 슬롯 제외)
    const validCharacters = characterIds.filter((id) => id !== -1)

    return {
      character_ids: JSON.stringify(validCharacters),
      character_count: validCharacters.length,
    }
  }

  // Load deck from URL on mount
  useEffect(() => {
    if (urlDeckCode && data) {
      const preset = decodePresetString(urlDeckCode)
      if (preset) {
        const importResult = importPresetObject(preset)
        if (importResult.success) {
          showToast(getTranslatedString(importResult.message) || "Import successful!", "success")

          // URL 임포트 성공 시 이벤트 로깅
          if (analytics && typeof window !== "undefined") {
            // 유효한 캐릭터 ID 리스트 추출 (빈 슬롯 제외)
            const validCharacters = preset.roleList.filter((id) => id !== -1)

            // 이벤트 파라미터 생성
            const eventParams = {
              language: currentLanguage,
              leader_id: preset.header,
              ...createCharacterParams(validCharacters),
            }

            logEvent(analytics, "url_import_success", eventParams)
          }
        } else {
          showToast(getTranslatedString(importResult.message) || "Import failed!", "error")

          // URL 임포트 실패 시 이벤트 로깅
          if (analytics && typeof window !== "undefined") {
            logEvent(analytics, "url_import_failed", {
              language: currentLanguage,
              error_message: importResult.message,
            })
          }
        }
      } else {
        showToast(getTranslatedString("import_failed") || "Import failed!", "error")

        // URL 임포트 실패 시 이벤트 로깅
        if (analytics && typeof window !== "undefined") {
          logEvent(analytics, "url_import_failed", {
            language: currentLanguage,
            error_message: "invalid_preset_format",
          })
        }
      }
    }
  }, [urlDeckCode, data, decodePresetString, importPresetObject, getTranslatedString, currentLanguage])

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
    showToast(getTranslatedString("deck_cleared") || "Deck cleared!", "info")

    // 덱 초기화 이벤트 로깅
    if (analytics && typeof window !== "undefined") {
      logEvent(analytics, "deck_cleared", {
        language: currentLanguage,
      })
    }
  }

  // Import from clipboard
  const handleImport = async () => {
    try {
      const importResult = await importPreset()
      if (importResult.success) {
        showToast(getTranslatedString(importResult.message) || "Deck imported successfully!", "success")

        // 클립보드 임포트 성공 시 이벤트 로깅
        if (analytics && typeof window !== "undefined") {
          // 유효한 캐릭터 ID 리스트 추출 (빈 슬롯 제외)
          const validCharacters = selectedCharacters.filter((id) => id !== -1)

          // 이벤트 파라미터 생성
          const eventParams = {
            language: currentLanguage,
            leader_id: leaderCharacter,
            ...createCharacterParams(validCharacters),
          }

          logEvent(analytics, "clipboard_import_success", eventParams)
        }
      } else {
        showToast(getTranslatedString(importResult.message) || "Import failed!", "error")

        // 클립보드 임포트 실패 시 이벤트 로깅
        if (analytics && typeof window !== "undefined") {
          logEvent(analytics, "clipboard_import_failed", {
            language: currentLanguage,
            error_message: importResult.message,
          })
        }
      }
    } catch (e) {
      showToast(getTranslatedString("import_failed") || "Import failed!", "error")

      // 클립보드 임포트 실패 시 이벤트 로깅
      if (analytics && typeof window !== "undefined") {
        logEvent(analytics, "clipboard_import_failed", {
          language: currentLanguage,
          error_message: e instanceof Error ? e.message : "unknown_error",
        })
      }
    }
  }

  // Export to clipboard
  const handleExport = async () => {
    try {
      const exportResult = exportPreset()
      if (exportResult.success) {
        // 성공 시 알림 팝업 표시
        showAlert(getTranslatedString(exportResult.message) || "Deck exported to clipboard successfully!")

        // 익스포트 성공 시 이벤트 로깅
        if (analytics && typeof window !== "undefined") {
          // 유효한 캐릭터 ID 리스트 추출 (빈 슬롯 제외)
          const validCharacters = selectedCharacters.filter((id) => id !== -1)

          // 이벤트 파라미터 생성
          const eventParams = {
            language: currentLanguage,
            leader_id: leaderCharacter,
            ...createCharacterParams(validCharacters),
          }

          logEvent(analytics, "export_success", eventParams)
        }
      } else {
        showToast(getTranslatedString(exportResult.message) || "Export failed!", "error")

        // 익스포트 실패 시 이벤트 로깅
        if (analytics && typeof window !== "undefined") {
          logEvent(analytics, "export_failed", {
            language: currentLanguage,
            error_message: exportResult.message,
          })
        }
      }
    } catch (e) {
      showToast(getTranslatedString("export_failed") || "Export failed!", "error")

      // 익스포트 실패 시 이벤트 로깅
      if (analytics && typeof window !== "undefined") {
        logEvent(analytics, "export_failed", {
          language: currentLanguage,
          error_message: e instanceof Error ? e.message : "unknown_error",
        })
      }
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

        // 공유 성공 시 이벤트 로깅
        if (analytics && typeof window !== "undefined") {
          // 유효한 캐릭터 ID 리스트 추출 (빈 슬롯 제외)
          const validCharacters = selectedCharacters.filter((id) => id !== -1)

          // 이벤트 파라미터 생성
          const eventParams = {
            language: currentLanguage,
            leader_id: leaderCharacter,
            ...createCharacterParams(validCharacters),
          }

          logEvent(analytics, "share_success", eventParams)
        }
      } else {
        showToast(getTranslatedString("share_link_failed") || "Failed to create share link!", "error")

        // 공유 실패 시 이벤트 로깅
        if (analytics && typeof window !== "undefined") {
          logEvent(analytics, "share_failed", {
            language: currentLanguage,
            error_message: "failed_to_create_url",
          })
        }
      }
    } catch (e) {
      showToast(getTranslatedString("share_link_failed") || "Failed to create share link!", "error")

      // 공유 실패 시 이벤트 로깅
      if (analytics && typeof window !== "undefined") {
        logEvent(analytics, "share_failed", {
          language: currentLanguage,
          error_message: e instanceof Error ? e.message : "unknown_error",
        })
      }
    }
  }

  // 페이지 로드 시 이벤트 로깅
  useEffect(() => {
    if (analytics && typeof window !== "undefined") {
      logEvent(analytics, "deck_builder_page_view", {
        language: currentLanguage,
        url_has_code: urlDeckCode ? "yes" : "no",
      })
    }
  }, [currentLanguage, urlDeckCode])

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

            // 스킬 ID 찾기 - 카드 ID로 스킬 찾기
            let skillId = null
            for (const sId in data.skills) {
              const skill = data.skills[sId]
              if (skill.cardID && skill.cardID.toString() === cardId) {
                skillId = sId
                break
              }
            }

            // 선택된 카드 목록에서 추가 정보 찾기
            const selectedCardInfo = selectedCards.find((c) => c.id === cardId)
            if (selectedCardInfo && selectedCardInfo.skillId) {
              // 이미 선택된 카드에 skillId가 있으면 사용
              skillId = selectedCardInfo.skillId.toString()
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
            let ownerId = null

            // 1. 선택된 카드 정보에서 ownerId 확인 (URL에서 불러온 경우 이 정보가 중요)
            if (selectedCardInfo && selectedCardInfo.ownerId && selectedCardInfo.ownerId !== -1) {
              ownerId = selectedCardInfo.ownerId
            }
            // 2. 카드 자체의 ownerId 확인
            else if (card.ownerId) {
              ownerId = card.ownerId
            }

            // ownerId가 있으면 해당 캐릭터 이미지 찾기
            if (ownerId) {
              const owner = getCharacter(ownerId)
              if (owner && owner.img_card) {
                characterImage = owner.img_card
              }
            }

            // 3. 스킬을 통해 캐릭터 찾기 (ownerId가 없거나 이미지를 찾지 못한 경우)
            if (!characterImage && skillId) {
              // 이 스킬을 가진 캐릭터 찾기
              for (const charId in data.characters) {
                const character = data.characters[charId]
                if (character && character.skillList) {
                  const hasSkill = character.skillList.some((s) => s.skillId.toString() === skillId)
                  if (hasSkill && character.img_card) {
                    characterImage = character.img_card
                    break
                  }
                }
              }
            }

            // 4. 여전히 이미지가 없으면 실제 placeholder 이미지 사용
            if (!characterImage) {
              // 주인이 없는 카드는 기본 placeholder 이미지 사용
              characterImage = "images/placeHolder Card.jpg/?height=200&width=200"

              // 카드 이미지도 placeholder로 설정
              if (!extraInfo.img_url) {
                extraInfo.img_url = "images/placeHolder Card.jpg/?height=100&width=100"
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

