"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import type { Card, CardExtraInfo, SpecialControl } from "../types"
import { SkillCard } from "./skill-card"
import { CardSettingsModal } from "./card-settings-modal"
import { TabbedInterface } from "./tabbed-interface"
import { DeckStats } from "./deck-stats"

// dnd-kit import - MouseSensor와 TouchSensor 추가
import { DndContext, closestCenter, useSensor, useSensors, DragOverlay, MouseSensor, TouchSensor } from "@dnd-kit/core"
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SkillWindowProps {
  selectedCards: {
    id: string
    useType: number
    useParam: number
    useParamMap?: Record<string, number>
    skillId?: number
  }[]
  availableCards: { card: Card; extraInfo: CardExtraInfo; characterImage?: string }[]
  onAddCard: (cardId: string) => void
  onRemoveCard: (cardId: string) => void
  onReorderCards: (fromIndex: number, toIndex: number) => void
  onUpdateCardSettings: (
    cardId: string,
    useType: number,
    useParam: number,
    useParamMap?: Record<string, number>,
  ) => void
  getTranslatedString: (key: string) => string
  specialControls: Record<string, SpecialControl>
  data: any
}

function SortableSkillCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
    position: "relative" as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-manipulation ${isDragging ? "dragging-card" : ""}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  )
}

// 태그 컴포넌트 - 파생카드 토글 상태에 따라 표시/숨김 처리
function StatusEffectTags({
  statusEffects,
  includeDerivedCards,
  getTranslatedString,
  forceShowAll = false, // 모든 태그를 강제로 표시할지 여부
}: {
  statusEffects: {
    id: string
    name: string
    color: string
    description: string
    source: "normal" | "derived" | "both"
  }[]
  includeDerivedCards: boolean
  getTranslatedString: (key: string) => string
  forceShowAll?: boolean
}) {
  return (
    <div className="neon-container p-4 mt-4">
      <h3 className="text-lg font-semibold mb-4 neon-text">
        {getTranslatedString("status_effects") || "Status Effects"}
      </h3>
      {statusEffects.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {statusEffects.map((effect) => (
            <div
              key={effect.id}
              className={`relative group tooltip-group ${
                !forceShowAll && !includeDerivedCards && effect.source === "derived" ? "hidden" : ""
              }`}
              onMouseEnter={(e) => {
                const tag = e.currentTarget
                const tagRect = tag.getBoundingClientRect()
                const tooltipWidth = 256 // 툴팁 너비
                const screenWidth = window.innerWidth

                // 태그의 중앙이 화면 중앙보다 오른쪽에 있는지 확인
                if (tagRect.left + tagRect.width / 2 > screenWidth / 2) {
                  // 오른쪽에 있으면 툴팁을 왼쪽으로 정렬
                  tag.style.setProperty("--tooltip-x", `${Math.max(tagRect.left - tooltipWidth, 10)}px`)
                  tag.style.setProperty("--tooltip-align", "left")
                } else {
                  // 왼쪽에 있으면 툴팁을 오른쪽으로 정렬
                  tag.style.setProperty("--tooltip-x", `${tagRect.right -60}px`)
                  tag.style.setProperty("--tooltip-align", "right")
                }

                // Y 위치는 태그 위에 표시
                const tooltipY = tagRect.top - 100
                tag.style.setProperty("--tooltip-y", `${tooltipY}px`)
              }}
            >
              <span
                className="px-2 py-1 bg-black bg-opacity-50 border rounded-md text-sm cursor-help"
                style={{
                  borderColor: effect.color,
                  color: effect.color,
                  boxShadow: `0 0 5px ${effect.color}40`,
                }}
              >
                {effect.name}
              </span>

              {/* 툴팁 */}
              <div
                className="fixed p-2 rounded text-xs text-gray-300 
                          invisible group-hover:visible z-10 border border-gray-700 pointer-events-none
                          bg-black bg-opacity-90 shadow-lg w-64"
                style={{
                  // 화면 위치에 따라 동적으로 위치 조정
                  left: "var(--tooltip-x, 0)",
                  top: "var(--tooltip-y, 0)",
                }}
              >
                <div className="font-bold mb-1" style={{ color: effect.color }}>
                  {effect.name}
                </div>
                <div>{effect.description}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">{getTranslatedString("no_status_effects") || "No status effects found"}</p>
      )}
    </div>
  )
}

function SkillPriorityTab({
  selectedCards,
  availableCards,
  onRemoveCard,
  onReorderCards,
  getTranslatedString,
  onEditCard,
  activeId,
  activeCardInfo,
  statusEffects,
  includeDerivedCards,
}: {
  selectedCards: { id: string; useType: number; useParam: number; useParamMap?: Record<string, number> }[]
  availableCards: { card: Card; extraInfo: CardExtraInfo; characterImage?: string }[]
  onRemoveCard: (cardId: string) => void
  onReorderCards: (fromIndex: number, toIndex: number) => void
  getTranslatedString: (key: string) => string
  onEditCard: (cardId: string) => void
  activeId: string | null
  activeCardInfo: { card: Card; extraInfo: CardExtraInfo; characterImage?: string } | null
  statusEffects: any[]
  includeDerivedCards: boolean
}) {
  return (
    <div className="w-full">
      {selectedCards.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          {getTranslatedString("no.skill.cards") || "No skill cards"}
        </div>
      ) : (
        <SortableContext items={selectedCards.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="skill-grid w-full">
            {selectedCards.map((selectedCard) => {
              const cardInfo = availableCards.find((c) => c.card.id.toString() === selectedCard.id.toString())

              if (!cardInfo) {
                return null
              }

              const { card, extraInfo, characterImage } = cardInfo
              const isDisabled = selectedCard.useType === 2

              return (
                <SortableSkillCard key={selectedCard.id} id={selectedCard.id}>
                  <SkillCard
                    card={card}
                    extraInfo={extraInfo}
                    getTranslatedString={getTranslatedString}
                    onRemove={() => onRemoveCard(selectedCard.id)}
                    onEdit={() => onEditCard(selectedCard.id)}
                    isDisabled={isDisabled}
                    characterImage={characterImage}
                  />
                </SortableSkillCard>
              )
            })}
          </div>
        </SortableContext>
      )}

      {/* 드래그 오버레이 추가 - 드래그 중인 카드의 시각적 표현 */}
      <DragOverlay adjustScale={true}>
        {activeId && activeCardInfo && (
          <div className="dragging-overlay">
            <SkillCard
              card={activeCardInfo.card}
              extraInfo={activeCardInfo.extraInfo}
              getTranslatedString={getTranslatedString}
              onRemove={() => {}}
              onEdit={() => {}}
              isDisabled={false}
              characterImage={activeCardInfo.characterImage}
            />
          </div>
        )}
      </DragOverlay>

      {/* 상태 효과(태그) 표시 */}
      <StatusEffectTags
        statusEffects={statusEffects}
        includeDerivedCards={includeDerivedCards}
        getTranslatedString={getTranslatedString}
        forceShowAll={true} // 우선순위 탭에서는 항상 모든 태그 표시
      />
    </div>
  )
}

export function SkillWindow({
  selectedCards,
  availableCards,
  onAddCard,
  onRemoveCard,
  onReorderCards,
  onUpdateCardSettings,
  getTranslatedString,
  specialControls,
  data,
}: SkillWindowProps) {
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const skillContainerRef = useRef<HTMLDivElement>(null)
  const [includeDerivedCards, setIncludeDerivedCards] = useState(true)

  // 태그 데이터와 색상 매핑을 상위 컴포넌트에서 관리
  const [tagData, setTagData] = useState<Record<string, any>>({})
  const [tagColorMapping, setTagColorMapping] = useState<Record<string, string[]>>({})

  // 태그 데이터 로드 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const loadTagData = async () => {
      try {
        // 태그 데이터 로드
        const tagResponse = await fetch("/api/db/tag_db.json")
        const tagData = await tagResponse.json()
        setTagData(tagData)

        // 태그 색상 매핑 데이터 로드
        const tagColorResponse = await fetch("/api/db/tag_color_mapping.json")
        const tagColorData = await tagColorResponse.json()
        setTagColorMapping(tagColorData)
      } catch (error) {
        console.error("Failed to load tag data:", error)
      }
    }

    loadTagData()
  }, []) // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 터치 디바이스 감지
  useEffect(() => {
    const detectTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0,
      )
    }

    detectTouch()

    // 윈도우 크기 변경 시 다시 감지
    window.addEventListener("resize", detectTouch)

    return () => {
      window.removeEventListener("resize", detectTouch)
    }
  }, [])

  // 터치 디바이스와 마우스 디바이스에 따라 다른 센서 설정
  const sensors = useSensors(
    // 마우스 센서 - 지연 없음
    useSensor(MouseSensor, {
      // 마우스 버튼 - 왼쪽 버튼만 허용
      activationConstraint: {
        distance: 5, // 5px 이상 움직여야 드래그 시작 (실수 방지)
      },
    }),
    // 터치 센서 - 롱프레스 적용
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms 이상 누르고 있어야 드래그 시작
        tolerance: 5, // 5px 이내의 움직임은 무시
      },
    }),
  )

  // Get the cards that are actually in the deck (not disabled)
  const activeCards = useMemo(() => {
    return selectedCards
      .filter((card) => card.useType !== 2) // Filter out disabled cards
      .map((selectedCard) => {
        const cardInfo = availableCards.find((c) => c.card.id.toString() === selectedCard.id)
        return cardInfo ? { ...cardInfo, selectedCard } : null
      })
      .filter(Boolean) as {
      card: Card
      extraInfo: CardExtraInfo
      characterImage?: string
      selectedCard: any
    }[]
  }, [selectedCards, availableCards])

  // 일반 카드와 파생 카드 분류
  const { normalCards, derivedCards } = useMemo(() => {
    if (!data) return { normalCards: [], derivedCards: [] }

    const normal: typeof activeCards = []
    const derived: typeof activeCards = []

    activeCards.forEach((cardInfo) => {
      let isDerived = true

      // 카드가 파생 카드인지 확인
      if (cardInfo.selectedCard.skillId) {
        // 모든 캐릭터의 스킬 맵 확인
        for (const charId in data.charSkillMap) {
          const charSkillMap = data.charSkillMap[charId]

          // 스킬이 캐릭터의 기본 스킬 목록에 있으면 파생 카드가 아님
          if (charSkillMap.skills && charSkillMap.skills.includes(cardInfo.selectedCard.skillId)) {
            isDerived = false
            break
          }
        }
      } else {
        // skillId가 없으면 일반 카드로 간주
        isDerived = false
      }

      if (isDerived) {
        derived.push(cardInfo)
      } else {
        normal.push(cardInfo)
      }
    })

    return { normalCards: normal, derivedCards: derived }
  }, [activeCards, data])

  // 상태 효과(태그) 계산 - 일반 카드와 파생 카드에서 나온 태그 분리
  const statusEffects = useMemo(() => {
    // 태그 데이터나 색상 매핑이 로드되지 않았으면 빈 배열 반환
    if (Object.keys(tagData).length === 0 || Object.keys(tagColorMapping).length === 0) {
      return []
    }

    // 모든 태그 ID를 색상 코드에 매핑하는 객체 생성
    const tagToColorMap: Record<string, string> = {}

    // 색상 코드별 태그 ID 배열을 순회하며 매핑 생성
    Object.entries(tagColorMapping).forEach(([colorCode, tagIds]) => {
      tagIds.forEach((tagId) => {
        tagToColorMap[tagId.toString()] = colorCode
      })
    })

    // 일반 카드에서 나온 태그 ID 집합
    const normalTagIds = new Set<string>()

    // 파생 카드에서 나온 태그 ID 집합
    const derivedTagIds = new Set<string>()

    // 일반 카드에서 태그 수집
    normalCards.forEach(({ card }) => {
      if (card.tagList && Array.isArray(card.tagList)) {
        card.tagList.forEach((tagItem) => {
          if (tagItem && tagItem.tagId) {
            normalTagIds.add(tagItem.tagId.toString())
          }
        })
      }
    })

    // 파생 카드에서 태그 수집
    derivedCards.forEach(({ card }) => {
      if (card.tagList && Array.isArray(card.tagList)) {
        card.tagList.forEach((tagItem) => {
          if (tagItem && tagItem.tagId) {
            derivedTagIds.add(tagItem.tagId.toString())
          }
        })
      }
    })

    // 모든 태그 ID 집합
    const allTagIds = new Set([...normalTagIds, ...derivedTagIds])

    // 태그 ID를 태그 정보로 변환
    return Array.from(allTagIds)
      .map((tagId) => {
        const tag = tagData[tagId]
        if (!tag) return null

        // 색상 매핑에 있는 태그만 포함
        const colorCode = tagToColorMap[tagId]
        if (!colorCode) return null

        // 태그 소스 결정 (일반, 파생, 또는 둘 다)
        let source: "normal" | "derived" | "both" = "normal"
        if (normalTagIds.has(tagId) && derivedTagIds.has(tagId)) {
          source = "both"
        } else if (derivedTagIds.has(tagId)) {
          source = "derived"
        }

        // Get translated tag name and description
        const tagName = getTranslatedString(tag.tagName) || tag.tagName
        const tagDesc = getTranslatedString(tag.detail) || tag.detail || ""

        return {
          id: tagId,
          name: tagName,
          color: colorCode,
          description: tagDesc,
          source, // 태그 소스 추가
        }
      })
      .filter(Boolean)
  }, [normalCards, derivedCards, tagData, tagColorMapping, getTranslatedString])

  const handleEditCard = (cardId: string) => {
    setEditingCard(cardId)
  }

  const handleSaveCardSettings = (
    cardId: string,
    useType: number,
    useParam: number,
    useParamMap?: Record<string, number>,
  ) => {
    onUpdateCardSettings(cardId, useType, useParam, useParamMap)
  }

  const handleCloseModal = () => setEditingCard(null)

  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id)

    // 드래그 시작 시 스크롤 방지
    document.body.style.overflow = "hidden"
    document.body.classList.add("dragging")

    // 스킬 컨테이너에 드래그 중 클래스 추가
    if (skillContainerRef.current) {
      skillContainerRef.current.classList.add("dragging-container")
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    // 드래그 종료 시 스크롤 다시 활성화
    document.body.style.overflow = ""
    document.body.classList.remove("dragging")

    // 스킬 컨테이너에서 드래그 중 클래스 제거
    if (skillContainerRef.current) {
      skillContainerRef.current.classList.remove("dragging-container")
    }

    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = selectedCards.findIndex((card) => card.id === active.id)
    const newIndex = selectedCards.findIndex((card) => card.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderCards(oldIndex, newIndex)
    }
  }

  // 현재 편집 중인 카드 정보 찾기
  const editingCardInfo = editingCard ? availableCards.find((c) => c.card.id.toString() === editingCard) : null
  const editingCardSettings = editingCard ? selectedCards.find((c) => c.id === editingCard) : null

  // 현재 드래그 중인 카드 정보 찾기
  const activeCardInfo = activeId ? availableCards.find((c) => c.card.id.toString() === activeId) : null

  return (
    <div className="w-full">
      {/* 제목 부분 제거 - DeckBuilder에서 관리하도록 변경 */}

      {/* 스킬 그리드 컨테이너의 패딩을 줄이고 여백을 최소화합니다 */}
      {/* neon-container 클래스가 있는 div의 패딩을 수정합니다 */}
      <div ref={skillContainerRef} className="neon-container p-0 min-h-[300px] overflow-hidden skill-container w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <TabbedInterface
            tabs={[
              {
                id: "priority",
                label: getTranslatedString("skill_priority") || "Skill Priority",
                content: (
                  <SkillPriorityTab
                    selectedCards={selectedCards}
                    availableCards={availableCards}
                    onRemoveCard={onRemoveCard}
                    onReorderCards={onReorderCards}
                    getTranslatedString={getTranslatedString}
                    onEditCard={handleEditCard}
                    activeId={activeId}
                    activeCardInfo={activeCardInfo}
                    statusEffects={statusEffects}
                    includeDerivedCards={includeDerivedCards}
                  />
                ),
              },
              {
                id: "stats",
                label: getTranslatedString("deck_stats") || "Deck Stats",
                content: (
                  <DeckStats
                    selectedCards={selectedCards}
                    availableCards={availableCards}
                    getTranslatedString={getTranslatedString}
                    data={data}
                    statusEffects={statusEffects}
                    includeDerivedCards={includeDerivedCards}
                    setIncludeDerivedCards={setIncludeDerivedCards}
                  />
                ),
              },
            ]}
            defaultTabId="priority"
          />
        </DndContext>
      </div>

      {editingCard && editingCardInfo && editingCardSettings && (
        <CardSettingsModal
          isOpen={true}
          onClose={handleCloseModal}
          card={editingCardInfo.card}
          extraInfo={editingCardInfo.extraInfo}
          initialUseType={editingCardSettings.useType}
          initialUseParam={editingCardSettings.useParam}
          initialUseParamMap={editingCardSettings.useParamMap}
          onSave={handleSaveCardSettings}
          getTranslatedString={getTranslatedString}
          characterImage={editingCardInfo.characterImage}
        />
      )}
    </div>
  )
}
