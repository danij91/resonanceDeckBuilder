"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
import { logEventWrapper } from "../lib/firebase-config"
import { useDataLoader } from "../hooks/use-data-loader"
import { LoadingScreen } from "./loading-screen"
import { SaveDeckModal } from "./ui/modal/SaveDeckModal" // 추가
import { LoadDeckModal } from "./ui/modal/LoadDeckModal" // 추가
import { getCurrentDeckId, setCurrentDeckId, removeCurrentDeckId, type SavedDeck } from "../utils/local-storage" // 추가

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
  const contentRef = useRef<HTMLDivElement>(null) // 캡처할 컨텐츠 참조 추가

  // useDataLoader 훅을 사용하여 실제 데이터 로드
  const { data, loading, error } = useDataLoader()

  // 로컬 로딩 상태 추가
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // 저장/불러오기 모달 상태 추가
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)

  // useDeckBuilder 훅 사용 - 실제 data 객체 전달
  const {
    selectedCharacters,
    leaderCharacter,
    selectedCards,
    battleSettings,
    equipment,
    awakening, // 각성 정보 추가
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
    updateAwakening, // 각성 업데이트 함수 추가
    clearAll,
    exportPreset,
    importPresetObject,
    createShareableUrl,
    decodePresetString,
    importPreset,
    createPresetObject, // 추가: 프리셋 객체 생성 함수
    setSelectedCharacters,
    setLeaderCharacter,
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
            const result = importPresetObject(preset, true) // isUrlImport 매개변수를 true로 설정
            if (result.success) {
              showToast(getTranslatedString(result.message), "success")

              // URL에서 로드한 경우 현재 편집 중인 덱 ID 제거
              removeCurrentDeckId()

              // Firebase Analytics 이벤트 전송
              logEventWrapper("deck_shared_visit", {
                deck_code: urlDeckCode,
                language: currentLanguage,
              })
            }
          }
        } catch (error) {
          console.error("Error decoding URL preset:", error)
        }
      } else {
        // URL에서 로드하지 않은 경우 로컬스토리지에서 현재 편집 중인 덱 확인
        const currentDeckId = getCurrentDeckId()
        if (currentDeckId) {
          // 현재 편집 중인 덱이 있으면 로드 모달 표시 여부 확인
          // 실제 구현에서는 자동 로드 또는 사용자에게 물어볼 수 있음
        }
      }

      // 로컬 로딩 상태 업데이트
      setIsLocalLoading(false)
      setInitialLoadComplete(true)
    }

    loadFromUrl()
  }, [data, urlDeckCode, importPresetObject, showToast, getTranslatedString, currentLanguage, initialLoadComplete])

  // 스킬 설명에서 #r 태그를 실제 값으로 대체하는 함수
  const processSkillDescription = useCallback(
    (skill: any, description: string) => {
      if (!skill || !description) return description

      // 번역된 설명 가져오기
      const translatedDesc = getTranslatedString(description)

      // Check if desParamList exists and has items
      if (skill.desParamList && skill.desParamList.length > 0) {
        // 모든 #r 태그를 찾아서 배열로 저장
        const rTags = translatedDesc.match(/#r/g) || []

        // #r 태그가 없으면 원본 반환
        if (rTags.length === 0) return translatedDesc

        let processedDesc = translatedDesc
        let rTagIndex = 0

        // desParamList의 각 항목을 순회하면서 #r 태그를 순서대로 대체
        for (let i = 0; i < skill.desParamList.length && rTagIndex < rTags.length; i++) {
          const param = skill.desParamList[i]
          const paramValue = param.param

          // Check if skillParamList exists
          if (skill.skillParamList && skill.skillParamList[0]) {
            // Find the skillRate key based on param value
            const rateKey = `skillRate${paramValue}_SN`
            if (skill.skillParamList[0][rateKey] !== undefined) {
              // Calculate the rate value (divide by 10000)
              let rateValue = Math.floor(skill.skillParamList[0][rateKey] / 10000)

              // Add % if isPercent is true
              if (param.isPercent) {
                rateValue = `${skill.skillParamList[0][rateKey] / 100}%`
              }

              // Replace only the first occurrence of #r
              processedDesc = processedDesc.replace(/#r/, rateValue.toString())
              rTagIndex++
            }
          }
        }

        return processedDesc
      }

      return translatedDesc
    },
    [getTranslatedString],
  )

  // availableCards 부분에서 extraInfo 객체 생성 시 name 처리 수정
  // 스킬 카드 정보 생성 부분 수정
  const availableCards = useMemo(() => {
    if (!data) return []

    const cardSet = new Set<string>()
    const validCharacters = selectedCharacters.filter((id) => id !== -1)

    // 캐릭터 스킬 맵에서 카드 ID 수집
    validCharacters.forEach((charId) => {
      const charSkillMap = data.charSkillMap?.[charId.toString()]
      if (!charSkillMap) return

      // 기본 스킬 처리
      if (charSkillMap.skills && Array.isArray(charSkillMap.skills)) {
        charSkillMap.skills.forEach((skillId: number) => {
          const skill = data.skills[skillId.toString()]
          if (skill && skill.cardID) {
            cardSet.add(skill.cardID.toString())
          }
        })
      }

      // 관련 스킬 처리
      if (charSkillMap.relatedSkills && Array.isArray(charSkillMap.relatedSkills)) {
        charSkillMap.relatedSkills.forEach((skillId: number) => {
          const skill = data.skills[skillId.toString()]
          if (skill && skill.cardID) {
            cardSet.add(skill.cardID.toString())
          }
        })
      }

      // 캐릭터에서 오지 않는 스킬 처리
      if (charSkillMap.notFromCharacters && Array.isArray(charSkillMap.notFromCharacters)) {
        charSkillMap.notFromCharacters.forEach((skillId: number) => {
          const skill = data.skills[skillId.toString()]
          if (skill && skill.cardID) {
            cardSet.add(skill.cardID.toString())
          }
        })
      }
    })

    // 장비 스킬 맵에서 카드 ID 수집
    validCharacters.forEach((charId, slotIndex) => {
      const charEquipment = equipment[slotIndex]

      // 각 장비 타입별로 처리
      const processEquipment = (equipId: string | null) => {
        if (!equipId) return

        // 장비 스킬 맵에서 관련 스킬 찾기
        const itemSkillMap = data.itemSkillMap?.[equipId]
        if (!itemSkillMap || !itemSkillMap.relatedSkills) return

        // 관련 스킬에서 카드 ID 수집
        itemSkillMap.relatedSkills.forEach((skillId: number) => {
          const skill = data.skills[skillId.toString()]
          if (skill && skill.cardID) {
            cardSet.add(skill.cardID.toString())
          }
        })
      }

      // 각 장비 타입에 대해 처리
      if (charEquipment.weapon) processEquipment(charEquipment.weapon)
      if (charEquipment.armor) processEquipment(charEquipment.armor)
      if (charEquipment.accessory) processEquipment(charEquipment.accessory)
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
          amount: 0, // 기본 수량을 0으로 설정
          img_url: undefined,
        }

        // 카드 ID에 해당하는 이미지 URL 찾기
        if (data.images && data.images[`card_${id}`]) {
          extraInfo.img_url = data.images[`card_${id}`]
        }

        // 스킬 ID를 통해 추가 정보 찾기
        let skillId = -1
        let skillObj = null
        for (const sId in data.skills) {
          const skill = data.skills[sId]
          if (skill && skill.cardID && skill.cardID.toString() === id) {
            // 스킬 이름을 extraInfo.name에 할당 - 번역된 이름 사용
            extraInfo.name = getTranslatedString(skill.name)
            // 스킬 설명을 extraInfo.desc에 할당 - 번역 및 #r 값 교체 적용
            extraInfo.desc = skill.description || ""
            // 스킬 ID 저장
            skillId = Number.parseInt(sId)
            // 스킬 객체 저장
            skillObj = skill

            // 스킬 이미지 URL 찾기
            if (data.images && data.images[`skill_${sId}`]) {
              extraInfo.img_url = data.images[`skill_${sId}`]
            }
            break
          }
        }

        // 스킬 설명 처리 - 번역 및 #r 값 교체
        if (skillObj) {
          extraInfo.desc = processSkillDescription(skillObj, extraInfo.desc)
        } else {
          // 스킬 객체가 없는 경우 기본 번역만 적용
          extraInfo.desc = getTranslatedString(extraInfo.desc)
        }

        // 카드 비용 정보 찾기 - cost_SN을 10000으로 나눈 값 사용
        if (card.cost_SN !== undefined) {
          // cost_SN을 10000으로 나누고 내림 처리
          const costValue = card.cost_SN > 0 ? Math.floor(card.cost_SN / 10000) : 0
          extraInfo.cost = costValue
        }

        // 카드 수량 정보 찾기 - 캐릭터의 skillList에서 해당 스킬의 num 값 찾기
        if (skillId !== -1) {
          for (const charId of validCharacters) {
            const character = data.characters[charId.toString()]
            if (character && character.skillList) {
              const skillItem = character.skillList.find((item) => item.skillId === skillId)
              if (skillItem && skillItem.num) {
                extraInfo.amount = skillItem.num
                break
              }
            }
          }
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
  }, [
    data,
    selectedCharacters,
    findCharacterImageForCard,
    selectedCards,
    processSkillDescription,
    getTranslatedString,
    equipment,
  ])

  // 클립보드에서 가져오기
  const handleImport = useCallback(async () => {
    try {
      const result = await importPreset()
      showToast(getTranslatedString(result.message), result.success ? "success" : "error")

      // 클립보드에서 가져온 경우 현재 편집 중인 덱 ID 제거
      removeCurrentDeckId()

      // Firebase Analytics 이벤트 전송
      const characterIds = selectedCharacters.filter((id) => id !== -1)
      logEventWrapper("deck_imported", {
        character_ids: JSON.stringify(characterIds),
        language: currentLanguage,
      })
    } catch (error) {
      console.error("Import error:", error)
      showToast(getTranslatedString("import_failed"), "error")
    }
  }, [importPreset, showToast, getTranslatedString, selectedCharacters, currentLanguage])

  // 클립보드로 내보내기
  const handleExport = useCallback(() => {
    try {
      const result = exportPreset()
      showToast(getTranslatedString(result.message), result.success ? "success" : "error")

      // Firebase Analytics 이벤트 전송
      const characterIds = selectedCharacters.filter((id) => id !== -1)
      logEventWrapper("deck_exported", {
        character_ids: JSON.stringify(characterIds),
        language: currentLanguage,
      })
    } catch (error) {
      console.error("Export error:", error)
      showToast(getTranslatedString("export_failed"), "error")
    }
  }, [exportPreset, showToast, getTranslatedString, selectedCharacters, currentLanguage])

  // 공유 링크 생성
  const handleShare = useCallback(() => {
    try {
      const result = createShareableUrl()
      if (result.success && result.url) {
        navigator.clipboard.writeText(result.url)
        showToast(getTranslatedString("share_link_copied_alert"), "success")

        // Firebase Analytics 이벤트 전송
        const characterIds = selectedCharacters.filter((id) => id !== -1)
        logEventWrapper("deck_shared", {
          character_ids: JSON.stringify(characterIds),
          language: currentLanguage,
        })
      } else {
        showToast(getTranslatedString("share_link_failed"), "error")
      }
    } catch (error) {
      console.error("Share error:", error)
      showToast(getTranslatedString("share_link_failed"), "error")
    }
  }, [createShareableUrl, showToast, getTranslatedString, selectedCharacters, currentLanguage])

  // 초기화
  const handleClear = useCallback(() => {
    clearAll()
    // 현재 편집 중인 덱 ID 제거
    removeCurrentDeckId()
    showToast(getTranslatedString("deck_cleared"), "success")
  }, [clearAll, showToast, getTranslatedString])

  // 각성 단계 선택 핸들러
  const handleAwakeningSelect = useCallback(
    (characterId: number, stage: number | null) => {
      updateAwakening(characterId, stage)
    },
    [updateAwakening],
  )

  // 덱 저장 모달 열기
  const handleOpenSaveModal = useCallback(() => {
    setShowSaveModal(true)
  }, [])

  // 덱 불러오기 모달 열기
  const handleOpenLoadModal = useCallback(() => {
    setShowLoadModal(true)
  }, [])

  // 덱 저장 성공 처리
  const handleSaveSuccess = useCallback(
    (deckId: string) => {
      showToast(getTranslatedString("deck_saved"), "success")
      // 현재 편집 중인 덱 ID 설정
      setCurrentDeckId(deckId)

      // Firebase Analytics 이벤트 전송
      const characterIds = selectedCharacters.filter((id) => id !== -1)
      logEventWrapper("deck_saved", {
        character_ids: JSON.stringify(characterIds),
        language: currentLanguage,
      })
    },
    [showToast, getTranslatedString, selectedCharacters, currentLanguage],
  )

  // 덱 불러오기 처리
  const handleLoadDeck = useCallback(
    (deck: SavedDeck) => {
      try {
        // 덱 프리셋 불러오기
        const result = importPresetObject(deck.preset)
        if (result.success) {
          // 현재 편집 중인 덱 ID 설정
          setCurrentDeckId(deck.id)
          showToast(getTranslatedString("deck_loaded") || "Deck loaded successfully!", "success")

          // Firebase Analytics 이벤트 전송
          const characterIds = selectedCharacters.filter((id) => id !== -1)
          logEventWrapper("deck_loaded", {
            character_ids: JSON.stringify(characterIds),
            language: currentLanguage,
          })
        } else {
          showToast(getTranslatedString("deck_load_error") || "Failed to load deck", "error")
        }
      } catch (error) {
        console.error("Error loading deck:", error)
        showToast(getTranslatedString("deck_load_error") || "Failed to load deck", "error")
      }
    },
    [importPresetObject, showToast, getTranslatedString, selectedCharacters, currentLanguage],
  )

  // 덱 삭제 처리
  const handleDeleteDeck = useCallback(
    (deckId: string) => {
      showToast(getTranslatedString("deck_deleted"), "success")

      // 현재 편집 중인 덱이 삭제된 덱이면 현재 덱 ID 제거
      if (getCurrentDeckId() === deckId) {
        removeCurrentDeckId()
      }
    },
    [showToast, getTranslatedString],
  )

  // 캐릭터 이름 가져오기 함수
  const getCharacterName = useCallback(
    (characterId: number): string => {
      if (!data || characterId === -1) return ""

      const character = data.characters[characterId.toString()]
      if (!character) return ""

      return getTranslatedString(character.name)
    },
    [data, getTranslatedString],
  )

  // 저장된 덱 공유 핸들러 추가
  const handleShareSavedDeck = useCallback(
    (deck: SavedDeck) => {
      try {
        // 덱 프리셋으로 공유 URL 생성
        const result = createShareableUrl(deck.preset)
        if (result.success && result.url) {
          navigator.clipboard.writeText(result.url)
          showToast(getTranslatedString("share_link_copied_alert"), "success")

          // Firebase Analytics 이벤트 전송
          const characterIds = deck.preset.roleList.filter((id) => id !== -1)
          logEventWrapper("deck_shared", {
            deck_name: deck.name,
            character_ids: JSON.stringify(characterIds),
            language: currentLanguage,
          })
        } else {
          showToast(getTranslatedString("share_link_failed"), "error")
        }
      } catch (error) {
        console.error("Share error:", error)
        showToast(getTranslatedString("share_link_failed"), "error")
      }
    },
    [createShareableUrl, showToast, getTranslatedString, currentLanguage],
  )

  // 캐릭터 정렬 함수 추가 - 항상 정의되도록 수정
  const handleSortCharacters = useCallback(() => {
    if (!data || !data.characters) return

    // 현재 선택된 캐릭터 중 유효한 캐릭터만 필터링
    const validCharacters = selectedCharacters
      .filter((id) => id !== -1)
      .map((id) => {
        const character = data.characters[id.toString()]
        return {
          id,
          line: character?.line || 999, // 기본값 설정
          subLine: character?.subLine || 0, // 기본값 설정
        }
      })

    // line이 작을수록 오른쪽, line이 같으면 subLine이 클수록 오른쪽으로 정렬
    validCharacters.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;      // line 오름차순
      return b.subLine - a.subLine;                       // subLine 내림차순
    })
    // 정렬된 캐릭터와 빈 슬롯(-1)을 조합하여 새 배열 생성
    const newSelectedCharacters = Array(5).fill(-1)

    // 정렬된 캐릭터를 오른쪽부터 채우기
    validCharacters.forEach((char, index) => {
      // 오른쪽부터 채우기 위해 역순으로 인덱스 계산
      const slotIndex = 4 - index
      if (slotIndex >= 0) {
        newSelectedCharacters[slotIndex] = char.id
      }
    })

    // 캐릭터 배열 업데이트
    setSelectedCharacters(newSelectedCharacters)

    // 리더 캐릭터 유효성 검사 및 업데이트
    if (leaderCharacter !== -1 && !newSelectedCharacters.includes(leaderCharacter)) {
      // 리더가 더 이상 선택된 캐릭터에 없으면 첫 번째 유효한 캐릭터를 리더로 설정
      const firstValidChar = newSelectedCharacters.find((id) => id !== -1)
      if (firstValidChar !== undefined) {
        setLeaderCharacter(firstValidChar)
      } else {
        setLeaderCharacter(-1)
      }
    }

    // 정렬 완료 알림
    showToast(getTranslatedString("characters_sorted") || "Characters sorted by position", "success")
  }, [
    data,
    selectedCharacters,
    leaderCharacter,
    setSelectedCharacters,
    setLeaderCharacter,
    showToast,
    getTranslatedString,
  ])

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
        onSave={handleOpenSaveModal}
        onLoad={handleOpenLoadModal}
        onSortCharacters={handleSortCharacters} // 정렬 함수 전달
        contentRef={contentRef}
      />

      {/* 컨테이너의 패딩을 조정하여 모바일에서 더 많은 공간을 확보합니다. */}
      <div className="container mx-auto px-0 sm:px-3 md:px-4 pt-40 md:pt-28 pb-8">
        {/* 캡처할 영역 */}
        <div ref={contentRef} className="capture-content">
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
            awakening={awakening}
            onAwakeningSelect={handleAwakeningSelect}
          />

          {/* 스킬 창 */}
          <div className="mt-8">
            <h2 className="neon-section-title">{getTranslatedString("skill.section.title") || "Skills"}</h2>
            <SkillWindow
              selectedCards={selectedCards}
              availableCards={availableCards}
              onAddCard={addCard}
              onRemoveCard={removeCard}
              onReorderCards={reorderCards}
              onUpdateCardSettings={updateCardSettings}
              getTranslatedString={getTranslatedString}
              specialControls={{}}
              data={data}
            />
          </div>

          {/* 전투 설정 - 캡처 영역에 포함 */}
          <BattleSettings
            settings={battleSettings}
            onUpdateSettings={updateBattleSettings}
            getTranslatedString={getTranslatedString}
          />
        </div>
      </div>

      <div className="mt-0 mb-0 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <span>Resonance Deck Builder © 2025 Heeyong Chang</span>
        <span className="hidden sm:inline">·</span>
        <a href="https://github.com/danij91/resonanceDeckBuilder" target="_blank" rel="noopener noreferrer">
          <img className="w-6 h-6" src="images/github-mark-white2.svg" />
        </a>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">GPLv3</span>
      </div>
      {/* 댓글 섹션 */}
      <CommentsSection currentLanguage={currentLanguage} />

      {/* 덱 저장 모달 */}
      <SaveDeckModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        preset={createPresetObject(true, true)} // 장비 정보와 각성 정보 포함
        getTranslatedString={getTranslatedString}
        onSaveSuccess={handleSaveSuccess}
        getCharacterName={getCharacterName}
      />

      {/* 덱 불러오기 모달 */}
      <LoadDeckModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        getTranslatedString={getTranslatedString}
        onLoadDeck={handleLoadDeck}
        onDeleteDeck={handleDeleteDeck}
        onShareDeck={handleShareSavedDeck} // 공유 기능 추가
      />
    </div>
  )
}
