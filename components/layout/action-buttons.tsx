"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Save, RotateCcw, Trash2 } from "lucide-react"
import { useDeck } from "@/contexts/deck-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ActionButtons() {
  const { resetToLastImport, clearAll } = useDeck()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)

  return (
    <motion.div
      className="flex justify-end space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="transition-all hover:scale-105">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your configuration to the last imported state. Any changes you've made will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetToLastImport()
                setShowResetDialog(false)
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="transition-all hover:scale-105">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all characters, skill cards, and battle settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAll()
                setShowClearDialog(false)
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button className="transition-all hover:scale-105">
        <Save className="h-4 w-4 mr-2" />
        Save Deck
      </Button>
    </motion.div>
  )
}

