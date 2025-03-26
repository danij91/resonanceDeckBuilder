"use client"

import { useState, useRef } from "react"
import { useDrag } from "react-dnd"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useDeck, type SkillCard as SkillCardType } from "@/contexts/deck-context"

interface SkillCardProps {
  card: SkillCardType
  index: number
  isDraggable?: boolean
}

export default function SkillCard({ card, index, isDraggable = true }: SkillCardProps) {
  const { removeSkillCard } = useDeck()
  const [showSkillInfo, setShowSkillInfo] = useState(false)
  const [selectedOption, setSelectedOption] = useState("none")
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "SKILL_CARD",
      item: { id: card.id, index },
      canDrag: isDraggable,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [card.id, index, isDraggable],
  ) // Add dependencies to ensure the drag source updates

  // Default values if not provided
  const cost = card.cost || Math.floor(Math.random() * 5) + 1
  const quantity = card.quantity || 1
  const characterImage = card.characterImage || "/placeholder.svg?height=200&width=100"
  const skillImage = card.skillImage || "/placeholder.svg?height=50&width=50"
  const description =
    card.description ||
    "This is a sample skill description. It would explain the effects and usage of this skill in battle."

  // Sample condition if not provided
  const condition = card.condition || {
    description: "When HP is below",
    operator: "<",
    value: 30,
  }

  // Connect the drag ref to our div ref only if draggable
  if (isDraggable) {
    drag(ref)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 1,
        }}
        layout
        layoutId={`card-${card.id}`}
      >
        <Card
          ref={ref}
          className={`relative ${isDraggable ? "cursor-move" : "cursor-default"} transition-all overflow-hidden ${isDragging ? "opacity-50" : "opacity-100"}`}
          style={{ aspectRatio: "1/1.5" }}
          data-card-id={card.id}
          data-card-index={index}
        >
          {/* Priority Badge (Top Left) */}
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-primary text-primary-foreground">{card.priority}</Badge>
          </div>

          {/* Character Image (Background) */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={characterImage || "/placeholder.svg"}
              alt={`Character for ${card.name}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
          </div>

          {/* Cost (Top Right) */}
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-amber-500 text-black font-bold">{cost}</Badge>
          </div>

          {/* Skill Image (Bottom Center) - Diamond Shape */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative w-14 h-14 bg-amber-500 rotate-45 overflow-hidden">
              <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
                <Image
                  src={skillImage || "/placeholder.svg"}
                  alt={`Skill icon for ${card.name}`}
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Skill Name (Bottom Left) */}
          <div className="absolute bottom-2 left-2 z-10">
            <p className="text-xs font-medium text-white drop-shadow-md">{card.name}</p>
          </div>

          {/* Info Button (Bottom Right) */}
          <div className="absolute bottom-2 right-2 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSkillInfo(true)
                    }}
                  >
                    <Info className="h-4 w-4 text-white/70" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Skill Info</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Drag Handle Indicator - Only show if draggable */}
          {isDraggable && (
            <div className="absolute top-1/2 right-1 z-10 text-white/50">
              <GripVertical className="h-5 w-5" />
            </div>
          )}
        </Card>
      </motion.div>

      {/* Skill Info Dialog */}
      <Dialog open={showSkillInfo} onOpenChange={setShowSkillInfo}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Skill Information</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Left Side - Skill Details */}
            <div className="w-full sm:w-1/2 space-y-4">
              {/* Skill Icon and Basic Info */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-amber-500 rotate-45 overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
                    <Image
                      src={skillImage || "/placeholder.svg"}
                      alt={card.name}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{card.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">Quantity: {quantity}</Badge>
                    <Badge className="bg-amber-500 text-black">Cost: {cost}</Badge>
                  </div>
                </div>
              </div>

              {/* Skill Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span> Attack
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span> Single
                  </div>
                  <div>
                    <span className="text-muted-foreground">Element:</span> Fire
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span> {card.priority}
                  </div>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden sm:block" />
            <Separator className="block sm:hidden" />

            {/* Right Side - Operation Options */}
            <div className="w-full sm:w-1/2">
              <h4 className="text-sm font-medium mb-4">Operation Settings</h4>

              <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-4">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="cast" id="cast" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="cast" className="font-medium">
                      Cast Immediately
                    </Label>
                    <p className="text-sm text-muted-foreground">Use this skill as soon as it's available</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="disable" id="disable" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="disable" className="font-medium">
                      Disable This Card
                    </Label>
                    <p className="text-sm text-muted-foreground">Never use this skill in battle</p>
                  </div>
                </div>

                {condition && (
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="conditional" id="conditional" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="conditional" className="font-medium">
                        Conditional Use
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {condition.description} {condition.operator} {condition.value}%
                      </p>
                    </div>
                  </div>
                )}
              </RadioGroup>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowSkillInfo(false)}>Apply</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

