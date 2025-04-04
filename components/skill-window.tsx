"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Card, CardExtraInfo, SpecialControl } from "../types"
import { SkillCard } from "./skill-card"
import { CardSettingsModal } from "./card-settings-modal"

// dnd-kit import - MouseSensor와 TouchSensor 추가
import { DndContext, closestCenter, useSensor, useSensors, DragOverlay, MouseSensor, TouchSensor } from "@dnd-kit/core"
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SkillWindowProps {
  selectedCards: { id: string; useType: number; useParam: number; useParamMap?: Record<string, number> }[]
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

export function SkillWindow({
  selectedCards,
  availableCards,
  onRemoveCard,
  onReorderCards,
  onUpdateCardSettings,
  getTranslatedString,
  specialControls,
}: SkillWindowProps) {
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const skillContainerRef = useRef<HTMLDivElement>(null)

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
    <div className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="neon-section-title">{getTranslatedString("skill.section.title") || "Skills"}</h2>
        {isTouchDevice && (
          <div className="text-xs text-gray-400">
            {getTranslatedString("longpress_to_drag") || "Long press to drag"}
          </div>
        )}
      </div>

      <div ref={skillContainerRef} className="neon-container p-4 min-h-[300px] overflow-hidden skill-container">
        {selectedCards.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            {getTranslatedString("no.skill.cards") || "No skill cards"}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={selectedCards.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className="skill-grid">
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
                        onEdit={() => handleEditCard(selectedCard.id)}
                        isDisabled={isDisabled}
                        characterImage={characterImage}
                      />
                    </SortableSkillCard>
                  )
                })}
              </div>
            </SortableContext>

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
          </DndContext>
        )}
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

