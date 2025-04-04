"use client"

import type React from "react"

import { useState } from "react"
import type { Card, CardExtraInfo, SpecialControl } from "../types"
import { SkillCard } from "./skill-card"
// 기존 import 문에서 변경
import { CardSettingsModal } from "./card-settings-modal"
// 기존 import에서 제거
// import { SkillInfoModal } from "./ui/modal/SkillInfoModal"

// dnd-kit import
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event

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

  return (
    <div className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="neon-section-title">{getTranslatedString("skill.section.title") || "Skills"}</h2>
      </div>

      <div className="neon-container p-4 min-h-[300px] overflow-auto">
        {selectedCards.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            {getTranslatedString("no.skill.cards") || "No skill cards"}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedCards.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-6 gap-2 sm:gap-4 auto-rows-max w-full overflow-x-auto">
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

