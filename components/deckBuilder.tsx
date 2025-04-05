"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { TopBar } from "./top-bar"
import { CharacterWindow } from "./character-window"
import { SkillWindow } from "./skill-window"
import { BattleSettings } from "./battle-settings"
import { CommentsSection } from "./comments-section"
import { useToast } from "./toast-notification"
import { useDeckBuilder } from "../hooks/deck-builder/index"
import { useLanguage } from "../contexts/language-context"
import { decodePresetFromUrlParam } from "../utils/presetCodec"
import { analytics, logEvent } from "../lib/firebase-config"
import { useDataLoader } from "../hooks/use-data-loader"
import { LoadingScreen } from "./loading-screen"

interface DeckBuilderProps {
  urlDeckCode: string | null
}

interface CardExtraInfo {
  name: string
  desc: string
  cost: number
  amount: number
  img_url: string | undefined
}

export default function DeckBuilder({ urlDeckCode }: DeckBuilderProps) {
  const { getTranslatedString, currentLanguage } = useLanguage()
  const searchParams = useSearchParams()
  const { showToast, ToastContainer } = useToast()
  const [isPhotoMode, setIsPhotoMode] = useState(false)

  // useDataLoader 훅을 사용하여 실제 데이터 로드
  const { data, loading, error } = useDataLoader()

  // 로컬 로딩 상태 추가
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // useDeckBuilder 훅 사용 - 실제 data 객체 전달
  const {
    selectedCharacters,
    leaderCharacter,
    selectedCards,
    battleSettings,
    equipment,
    availableCards: availableCardsFromHook,
    getCharacter,
    getCard,
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
    clearAll,
    exportPreset,
    importPresetObject,
    createShareableUrl,
    decodePresetString,
    importPreset, // importPreset 추가
  } = useDeckBuilder(data)

  // URL을 통해 덱 프리셋을 받아올 때 ownerId를 char_db에서 검색하여 카드에 캐릭터 초상화 표시 로직 개선

  // findCharacterImageForCard 함수를 수정하여 더 강력하게 만들기
  const findCharacterImageForCard = useCallback(
    (card: any) => {
      if (!data || !card) {
        return "images/placeHolder Card.jpg" // 기본 이미지 경로
      }

      // 카드에 ownerId가 있고 유효한지 확인
      if (card.ownerId && card.ownerId !== -1) {
        // 1. 이미지 데이터베이스에서 char_{ownerId} 키로 직접 찾기
        if (data.images && data.images[`char_${card.ownerId}`]) {
          return data.images[`char_${card.ownerId}`]
        }

        // 2. 캐릭터 객체에서 img_card 속성 찾기
        const character = data.characters[card.ownerId.toString()]
        if (character && character.img_card) {
          return character.img_card
        }
      }

      // ownerId가 없거나 이미지를 찾을 수 없으면 기본 이미지 반환
      return "images/placeHolder Card.jpg"
    },
    [data],
  )

  // URL에서 코드 파라미터 처리 - 비동기 함수 사용 문제 해결
  useEffect(() => {
    // 이미 로드 완료된 경우 다시 실행하지 않음
    if (initialLoadComplete || !data) return

    const loadFromUrl = () => {
      if (urlDeckCode) {
        try {
          const preset = decodePresetFromUrlParam(urlDeckCode)
          if (preset) {
            const result = importPresetObject(preset)
            if (result.success) {
              showToast(getTranslatedString(result.message), "success")

              // Firebase Analytics 이벤트 전송
              if (analytics && typeof window !== "undefined") {
                logEvent(analytics, "deck_shared_visit", {
                  deck_code: urlDeckCode,
                  language: currentLanguage,
                })
              }
            }
          }
        } catch (error) {
          console.error("Error decoding URL preset:", error)
        }
      }

      // 로컬 로딩 상태 업데이트
      setIsLocalLoading(false)
      setInitialLoadComplete(true)
    }

    loadFromUrl()
  }, [data, urlDeckCode, importPresetObject, showToast, getTranslatedString, currentLanguage, initialLoadComplete])

  // 스킬 카드 정보 생성 부분 수정
  // availableCards 부분에서 extraInfo 객체 생성 시 cost 값을 제대로 설정하도록 수정
  const availableCards = useMemo(() => {
    if (!data) return []

    const cardSet = new Set<string>()
    const validCharacters = selectedCharacters.filter((id) => id !== -1)

    // 모든 카드 순회
    Object.values(data.cards).forEach((card) => {
      // 카드 소유자 확인
      if (card.ownerId && validCharacters.includes(card.ownerId)) {
        cardSet.add(card.id.toString())
      }
    })

    // 스킬에서 카드 ID 찾기
    validCharacters.forEach((charId) => {
      const character = data.characters[charId.toString()]
      if (character && character.skillList) {
        character.skillList.forEach((skillItem) => {
          const skill = data.skills[skillItem.skillId.toString()]
          if (skill && skill.cardID) {
            cardSet.add(skill.cardID.toString())
          }

          // ExSkillList에서 카드 ID 찾기
          if (skill && skill.ExSkillList && skill.ExSkillList.length > 0) {
            skill.ExSkillList.forEach((exSkill) => {
              const exSkillData = data.skills[exSkill.ExSkillName.toString()]
              if (exSkillData && exSkillData.cardID) {
                cardSet.add(exSkillData.cardID.toString())
              }
            })
          }
        })
      }
    })

    // 중요: selectedCards에서 모든 카드 ID를 cardSet에 추가
    // 이렇게 하면 장비에서 추가된 카드들도 포함됩니다
    selectedCards.forEach((card) => {
      cardSet.add(card.id)
    })

    // Convert to array
    return Array.from(cardSet)
      .map((id) => {
        const card = data.cards[id]
        if (!card) return null

        // 기본 extraInfo 객체 생성 - 일단 카드 이름으로 초기화
        const extraInfo: CardExtraInfo = {
          name: card.name || `card_name_${id}`,
          desc: "",
          cost: 0, // 기본값 설정
          amount: 1,
          img_url: undefined,
        }

        // 카드 ID에 해당하는 이미지 URL 찾기
        if (data.images && data.images[`card_${id}`]) {
          extraInfo.img_url = data.images[`card_${id}`]
        }

        // 스킬 ID를 통해 추가 정보 찾기
        for (const skillId in data.skills) {
          const skill = data.skills[skillId]
          if (skill && skill.cardID && skill.cardID.toString() === id) {
            // 스킬 이름을 extraInfo.name에 할당
            extraInfo.name = skill.name

            // 스킬 설명을 extraInfo.desc에 할당
            extraInfo.desc = skill.description || ""

            // 스킬 이미지 URL 찾기
            if (data.images && data.images[`skill_${skillId}`]) {
              extraInfo.img_url = data.images[`skill_${skillId}`]
            }
            break
          }
        }

        // 카드 비용 정보 찾기 - cost_SN을 10000으로 나눈 값 사용
        if (card.cost_SN !== undefined) {
          // cost_SN을 10000으로 나누고 내림 처리
          const costValue = card.cost_SN > 0 ? Math.floor(card.cost_SN / 10000) : 0
          extraInfo.cost = costValue
        }

        // 중요: selectedCards에서 해당 카드를 찾아 ownerId 정보 가져오기
        const selectedCard = selectedCards.find((sc) => sc.id === id)

        // 캐릭터 이미지 연결 - 더 강력한 로직 사용
        // 선택된 카드가 있으면 그 카드 객체를 사용, 없으면 기본 카드 객체 사용
        const cardForImage = selectedCard || card
        const characterImage = findCharacterImageForCard(cardForImage)

        return { card, cardForImage, extraInfo, characterImage }
      })
      .filter(Boolean)
  }, [data, selectedCharacters, findCharacterImageForCard, selectedCards]) // selectedCards 의존성 추가

  // 클립보드에서 가져오기
  const handleImport = async () => {
    try {
      const result = await importPreset()
      showToast(getTranslatedString(result.message), result.success ? "success" : "error")

      // Firebase Analytics 이벤트 전송
      if (analytics && result.success) {
        const characterIds = selectedCharacters.filter((id) => id !== -1)
        logEvent(analytics, "deck_imported", {
          character_ids: JSON.stringify(characterIds),
          language: currentLanguage,
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      showToast(getTranslatedString("import_failed"), "error")
    }
  }

  // 클립보드로 내보내기
  const handleExport = () => {
    try {
      const result = exportPreset()
      showToast(getTranslatedString(result.message), result.success ? "success" : "error")

      // Firebase Analytics 이벤트 전송
      if (analytics && result.success) {
        const characterIds = selectedCharacters.filter((id) => id !== -1)
        logEvent(analytics, "deck_exported", {
          character_ids: JSON.stringify(characterIds),
          language: currentLanguage,
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      showToast(getTranslatedString("export_failed"), "error")
    }
  }

  // 공유 링크 생성
  const handleShare = () => {
    try {
      const result = createShareableUrl()
      if (result.success && result.url) {
        navigator.clipboard.writeText(result.url)
        showToast(getTranslatedString("share_link_copied_alert"), "success")

        // Firebase Analytics 이벤트 전송
        if (analytics) {
          const characterIds = selectedCharacters.filter((id) => id !== -1)
          logEvent(analytics, "deck_shared", {
            character_ids: JSON.stringify(characterIds),
            language: currentLanguage,
          })
        }
      } else {
        showToast(getTranslatedString("share_link_failed"), "error")
      }
    } catch (error) {
      console.error("Share error:", error)
      showToast(getTranslatedString("share_link_failed"), "error")
    }
  }

  // 초기화
  const handleClear = () => {
    clearAll()
    showToast(getTranslatedString("deck_cleared"), "success")
  }

  // 사진찍기모드 토글
  const togglePhotoMode = () => {
    setIsPhotoMode(!isPhotoMode)
  }

  // 로딩 중 표시
  if (loading || isLocalLoading) {
    return <LoadingScreen message={getTranslatedString("loading") || "Loading..."} />
  }

  // 에러 처리
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500 p-4 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">
            {getTranslatedString("error_loading_data") || "Error Loading Data"}
          </h2>
          <p>{error.message}</p>
          <p className="mt-2 text-sm">
            {getTranslatedString("check_console") || "Please check console for more details."}
          </p>
        </div>
      </div>
    )
  }

  // 데이터가 없는 경우
  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-yellow-500 p-4 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">{getTranslatedString("no_data") || "No Data Available"}</h2>
          <p>{getTranslatedString("data_not_loaded") || "Data could not be loaded. Please try again later."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastContainer />

      <TopBar
        onClear={handleClear}
        onImport={handleImport}
        onExport={handleExport}
        onShare={handleShare}
        onTogglePhotoMode={togglePhotoMode}
        isPhotoMode={isPhotoMode}
      />

      {/* 컨테이너의 패딩을 조정하여 모바일에서 더 많은 공간을 확보합니다. */}
      <div className="container mx-auto px-0 sm:px-3 md:px-4 pt-40 md:pt-28 pb-8">
        {/* 캐릭터 창 */}
        <CharacterWindow
          selectedCharacters={selectedCharacters}
          leaderCharacter={leaderCharacter}
          onAddCharacter={addCharacter}
          onRemoveCharacter={removeCharacter}
          onSetLeader={setLeader}
          getCharacter={getCharacter}
          getTranslatedString={getTranslatedString}
          availableCharacters={data && data.characters ? Object.values(data.characters) : []}
          equipment={equipment}
          onEquipItem={updateEquipment}
          getCardInfo={getCardInfo}
          getEquipment={getEquipment}
          equipments={allEquipments}
          data={data}
          getSkill={getSkill}
        />

        {/* 사진찍기모드가 아닐 때만 표시할 제목 */}
        {!isPhotoMode && (
          <div className="mt-8">
            <h2 className="neon-section-title">{getTranslatedString("skill.section.title") || "Skills"}</h2>
          </div>
        )}

        {/* 스킬 창 - 사진찍기모드일 때는 마진 제거 */}
        <div className={isPhotoMode ? "mt-0" : "mt-0"}>
          <SkillWindow
            selectedCards={selectedCards}
            availableCards={availableCards}
            onAddCard={addCard}
            onRemoveCard={removeCard}
            onReorderCards={reorderCards}
            onUpdateCardSettings={updateCardSettings}
            getTranslatedString={getTranslatedString}
            specialControls={{}}
          />
        </div>

        {/* 전투 설정 - 사진찍기모드일 때는 숨김 */}
        {!isPhotoMode && (
          <BattleSettings
            settings={battleSettings}
            onUpdateSettings={updateBattleSettings}
            getTranslatedString={getTranslatedString}
          />
        )}
      </div>

      {/* 댓글 섹션 - 사진찍기모드일 때는 숨김 */}
      {!isPhotoMode && <CommentsSection currentLanguage={currentLanguage} />}
    </div>
  )
}

