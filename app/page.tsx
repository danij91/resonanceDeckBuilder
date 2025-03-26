"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import DeckSearch from "@/components/deck-search"
import CommunityDiscussion from "@/components/community-discussion"
import { DeckProvider, useDeck } from "@/contexts/deck-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Layout components
import Header from "@/components/layout/header"
import LanguageSelector from "@/components/layout/language-selector"
import ActionButtons from "@/components/layout/action-buttons"

// Section components
import CharacterSection from "@/components/sections/character-section"
import SkillCardSection from "@/components/sections/skill-card-section"
import BattleSettingsSection from "@/components/sections/battle-settings-section"

function DeckBuilder() {
  const [showDeckSearch, setShowDeckSearch] = useState(false)
  const [showCommunityDiscussion, setShowCommunityDiscussion] = useState(false)
  const { isLoading } = useDeck()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={48} className="mb-4" />
          <p className="text-lg">Loading game data...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme toggle and actions */}
        <Header
          onOpenDeckSearch={() => setShowDeckSearch(true)}
          onOpenCommunityDiscussion={() => setShowCommunityDiscussion(true)}
        />

        {/* Language Selection Tab and Clipboard Actions */}
        <LanguageSelector />

        {/* Main Content */}
        <div className="space-y-8">
          {/* Character Portraits and Equipment */}
          <CharacterSection />

          {/* Skill Card Priority List */}
          <SkillCardSection />

          {/* Battle Settings Configuration */}
          <BattleSettingsSection />

          {/* Action Buttons */}
          <ActionButtons />
        </div>
      </div>

      {/* Deck Search Modal */}
      {showDeckSearch && <DeckSearch onClose={() => setShowDeckSearch(false)} />}

      {/* Community Discussion Modal */}
      {showCommunityDiscussion && <CommunityDiscussion onClose={() => setShowCommunityDiscussion(false)} />}
    </main>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Fix hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until client-side to prevent hydration issues with theme
  if (!mounted) return null

  return (
    <DeckProvider>
      <DndProvider backend={HTML5Backend}>
        <DeckBuilder />
      </DndProvider>
    </DeckProvider>
  )
}

