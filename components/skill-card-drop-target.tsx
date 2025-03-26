"use client"

import type React from "react"

import { useRef } from "react"
import { useDrop } from "react-dnd"
import { motion } from "framer-motion"
import { useDeck } from "@/contexts/deck-context"

interface SkillCardDropTargetProps {
  index: number
  children: React.ReactNode
}

export default function SkillCardDropTarget({ index, children }: SkillCardDropTargetProps) {
  const { moveCard } = useDeck()
  const ref = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop({
    accept: "SKILL_CARD",
    drop(item: { id: number; index: number }) {
      if (item.index === index) {
        return // Don't replace items with themselves
      }

      // Move the card to the new position
      moveCard(item.index, index)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  drop(ref)

  return (
    <motion.div
      ref={ref}
      className={`${isOver ? "ring-2 ring-primary bg-primary/10 scale-105" : ""}`}
      data-index={index}
      layout
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
}

