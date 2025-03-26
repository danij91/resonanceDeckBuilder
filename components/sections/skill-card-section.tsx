"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDeck } from "@/contexts/deck-context"
import SkillCard from "@/components/skill-card"
import SkillCardDropTarget from "@/components/skill-card-drop-target"
import { AnimatePresence } from "framer-motion"

export default function SkillCardSection() {
  const { skillCards, addSkillCard } = useDeck()

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Skill Card Priority</h2>
        <Button onClick={addSkillCard} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>
      <Card className="border rounded-md overflow-hidden">
        <ScrollArea className="h-[800px]">
          <div className="p-4">
            <div className="grid grid-cols-6 gap-3">
              <AnimatePresence mode="sync">
                {skillCards.map((card, index) => (
                  <SkillCardDropTarget key={`drop-target-${card.id}-${index}`} index={index}>
                    <SkillCard key={`card-${card.id}`} card={card} index={index} isDraggable={true} />
                  </SkillCardDropTarget>
                ))}
              </AnimatePresence>
              {skillCards.length === 0 && (
                <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground">
                  No skill cards added. Click "Add Card" to begin.
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </Card>
    </section>
  )
}

