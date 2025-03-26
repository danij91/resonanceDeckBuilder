"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import {
  parseImportedData,
  formatExportData,
  type CardDB,
  type CardTexts,
  type CharacterDB,
  type CharacterTexts,
  type ImportedData,
} from "@/utils/data-parser"
import { useToast } from "@/hooks/use-toast"

// Define types for our state
export interface Character {
  id: number
  name: string
  rank: string
  image: string
  skills?: any[]
  resonance?: any[]
  awakening?: any[]
}

export interface SkillCard {
  id: number
  name: string
  priority: number
  cost: number
  characterImage: string
  skillImage?: string
  description?: string
  ownerId?: number
  skillId?: number | string
  quantity?: number
  targetType?: number
  useParam?: number
  useType?: number
  skillIndex?: number
  useParamMap?: Record<string, number>
  equipIdList?: any[]
  condition?: {
    description: string
    operator: string
    value: number
  }
}

export interface BattleSettings {
  leaderSkillActive: boolean
  ultimateSkillActive: boolean
  discardCondition: string
  handRetention: number
  enemyCardPriority: string
}

interface DeckContextType {
  // Characters
  characters: (Character | null)[]
  setCharacters: (characters: (Character | null)[]) => void
  leaderId: number | null
  setLeaderId: (id: number | null) => void

  // Skill Cards
  skillCards: SkillCard[]
  setSkillCards: (cards: SkillCard[]) => void
  addSkillCard: () => void
  removeSkillCard: (id: number) => void
  moveCard: (dragIndex: number, hoverIndex: number) => void

  // Battle Settings
  battleSettings: BattleSettings
  updateBattleSetting: (key: keyof BattleSettings, value: any) => void

  // Import/Export
  exportToClipboard: () => void
  importFromClipboard: () => void
  exportData: () => ImportedData
  importData: (data: ImportedData) => void

  // Reset/Clear
  resetToLastImport: () => void
  clearAll: () => void

  // Database
  cardDB: CardDB | null
  cardTexts: CardTexts | null
  characterDB: CharacterDB | null
  characterTexts: CharacterTexts | null
  isLoading: boolean
}

// Sample character images for skill cards
const sampleCharacterImages = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oZxyp3wUGM7KsuONHEuGaRqWHQIxoC.png",
  "/placeholder.svg?height=250&width=100",
  "/placeholder.svg?height=250&width=100",
  "/placeholder.svg?height=250&width=100",
  "/placeholder.svg?height=250&width=100",
]

// Default battle settings
const defaultBattleSettings: BattleSettings = {
  leaderSkillActive: true,
  ultimateSkillActive: true,
  discardCondition: "auto",
  handRetention: 3,
  enemyCardPriority: "highest-attack",
}

// Create the context
const DeckContext = createContext<DeckContextType | undefined>(undefined)

export function DeckProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  // Database state
  const [cardDB, setCardDB] = useState<CardDB | null>(null)
  const [cardTexts, setCardTexts] = useState<CardTexts | null>(null)
  const [characterDB, setCharacterDB] = useState<CharacterDB | null>(null)
  const [characterTexts, setCharacterTexts] = useState<CharacterTexts | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Character state
  const [characters, setCharacters] = useState<(Character | null)[]>(Array(5).fill(null))
  const [leaderId, setLeaderId] = useState<number | null>(null)

  // Skill cards state
  const [skillCards, setSkillCards] = useState<SkillCard[]>([])

  // Battle settings state
  const [battleSettings, setBattleSettings] = useState<BattleSettings>({ ...defaultBattleSettings })

  // Last imported state for reset functionality
  const [lastImportedState, setLastImportedState] = useState<{
    characters: (Character | null)[]
    leaderId: number | null
    skillCards: SkillCard[]
    battleSettings: BattleSettings
  } | null>(null)

  // Load database files
  useEffect(() => {
    const loadDatabases = async () => {
      try {
        setIsLoading(true)

        // Load card database
        const cardDBResponse = await fetch("/api/data/card-db")
        const cardDBData = await cardDBResponse.json()
        setCardDB(cardDBData)

        // Load card texts
        const cardTextsResponse = await fetch("/api/data/card-texts")
        const cardTextsData = await cardTextsResponse.json()
        setCardTexts(cardTextsData)

        // Load character database
        const characterDBResponse = await fetch("/api/data/character-db")
        const characterDBData = await characterDBResponse.json()
        setCharacterDB(characterDBData)

        // Load character texts
        const characterTextsResponse = await fetch("/api/data/character-texts")
        const characterTextsData = await characterTextsResponse.json()
        setCharacterTexts(characterTextsData)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading databases:", error)
        toast({
          title: "Error loading data",
          description: "Failed to load game data. Some features may not work correctly.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadDatabases()
  }, [toast])

  // Add a new skill card
  const addSkillCard = useCallback(() => {
    setSkillCards((prev) => {
      const newId = Date.now()
      const newCard = {
        id: newId,
        name: `New Skill ${prev.length + 1}`,
        priority: prev.length + 1,
        cost: Math.floor(Math.random() * 5) + 1,
        characterImage: sampleCharacterImages[newId % sampleCharacterImages.length],
        targetType: 0,
        useParam: -1,
        useType: 1,
      }

      // Create a new array with the new card
      const newCards = [...prev, newCard]

      // Update priorities to ensure they're sequential
      return newCards.map((card, index) => ({
        ...card,
        priority: index + 1,
      }))
    })
  }, [])

  // Remove a skill card
  const removeSkillCard = useCallback((id: number) => {
    setSkillCards((prev) => {
      // Filter out the card to remove
      const filteredCards = prev.filter((card) => card.id !== id)

      // Update priorities to ensure they're sequential
      return filteredCards.map((card, index) => ({
        ...card,
        priority: index + 1,
      }))
    })
  }, [])

  // Move a card (drag and drop) - completely rewritten for reliability
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    console.log(`Moving card from index ${dragIndex} to index ${hoverIndex}`)

    setSkillCards((prevCards) => {
      // Create a new array to avoid mutation
      const newCards = [...prevCards]

      // Ensure indices are valid
      if (dragIndex < 0 || dragIndex >= newCards.length || hoverIndex < 0 || hoverIndex >= newCards.length) {
        console.error("Invalid indices for card movement", { dragIndex, hoverIndex, length: newCards.length })
        return prevCards
      }

      // Get the card being dragged
      const dragCard = { ...newCards[dragIndex] }

      // Remove the card from its original position
      newCards.splice(dragIndex, 1)

      // Insert the card at the new position
      newCards.splice(hoverIndex, 0, dragCard)

      // Update priorities based on new order
      const updatedCards = newCards.map((card, index) => ({
        ...card,
        priority: index + 1,
      }))

      // Ensure we're returning a new array for React to detect the change
      return [...updatedCards]
    })
  }, [])

  // Update battle settings
  const updateBattleSetting = useCallback((key: keyof BattleSettings, value: any) => {
    setBattleSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  // Export data in the required format
  const exportData = useCallback(() => {
    return formatExportData(characters, leaderId, skillCards, battleSettings)
  }, [characters, leaderId, skillCards, battleSettings])

  // Import data from the required format
  const importData = useCallback(
    (importedData: ImportedData) => {
      if (!cardDB || !cardTexts || !characterDB || !characterTexts) {
        toast({
          title: "Import failed",
          description: "Game data is still loading. Please try again in a moment.",
          variant: "destructive",
        })
        return
      }

      try {
        const parsedData = parseImportedData(importedData, cardDB, cardTexts, characterDB, characterTexts)

        // Save the imported state for reset functionality
        setLastImportedState({
          characters: [...parsedData.characters],
          leaderId: parsedData.leaderId,
          skillCards: [...parsedData.skillCards],
          battleSettings: { ...parsedData.battleSettings },
        })

        // Update the current state
        setCharacters(parsedData.characters)
        setLeaderId(parsedData.leaderId)
        setSkillCards(parsedData.skillCards)
        setBattleSettings(parsedData.battleSettings)

        toast({
          title: "Import successful",
          description: "Deck configuration has been imported",
        })
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import failed",
          description: "An error occurred while parsing the import data",
          variant: "destructive",
        })
      }
    },
    [cardDB, cardTexts, characterDB, characterTexts, toast],
  )

  // Export deck to clipboard
  const exportToClipboard = useCallback(() => {
    try {
      const exportData = formatExportData(characters, leaderId, skillCards, battleSettings)

      navigator.clipboard
        .writeText(JSON.stringify(exportData, null, 2))
        .then(() => {
          toast({
            title: "Exported to clipboard",
            description: "Deck configuration has been copied to your clipboard",
          })
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
          toast({
            title: "Export failed",
            description: "Failed to copy to clipboard",
            variant: "destructive",
          })
        })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "An error occurred while formatting the export data",
        variant: "destructive",
      })
    }
  }, [characters, leaderId, skillCards, battleSettings, toast])

  // Import deck from clipboard
  const importFromClipboard = useCallback(() => {
    if (!cardDB || !cardTexts || !characterDB || !characterTexts) {
      toast({
        title: "Import failed",
        description: "Game data is still loading. Please try again in a moment.",
        variant: "destructive",
      })
      return
    }

    try {
      navigator.clipboard
        .readText()
        .then((text) => {
          try {
            const importedData = JSON.parse(text) as ImportedData

            // Validate the imported data
            if (importedData.roleList && importedData.cardList) {
              importData(importedData)
            } else {
              throw new Error("Invalid data format")
            }
          } catch (parseError) {
            console.error("Parse error:", parseError)
            toast({
              title: "Import failed",
              description: "Invalid data format in clipboard",
              variant: "destructive",
            })
          }
        })
        .catch((err) => {
          console.error("Failed to read clipboard: ", err)
          toast({
            title: "Import failed",
            description: "Failed to read from clipboard",
            variant: "destructive",
          })
        })
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }, [cardDB, cardTexts, characterDB, characterTexts, importData, toast])

  // Reset to last imported state
  const resetToLastImport = useCallback(() => {
    if (!lastImportedState) {
      toast({
        title: "Reset failed",
        description: "No previous import found to reset to",
        variant: "destructive",
      })
      return
    }

    setCharacters([...lastImportedState.characters])
    setLeaderId(lastImportedState.leaderId)
    setSkillCards([...lastImportedState.skillCards])
    setBattleSettings({ ...lastImportedState.battleSettings })

    toast({
      title: "Reset successful",
      description: "Deck configuration has been reset to the last imported state",
    })
  }, [lastImportedState, toast])

  // Clear all data
  const clearAll = useCallback(() => {
    setCharacters(Array(5).fill(null))
    setLeaderId(null)
    setSkillCards([])
    setBattleSettings({ ...defaultBattleSettings })

    toast({
      title: "Clear successful",
      description: "Deck configuration has been cleared",
    })
  }, [toast])

  const value = {
    characters,
    setCharacters,
    leaderId,
    setLeaderId,
    skillCards,
    setSkillCards,
    addSkillCard,
    removeSkillCard,
    moveCard,
    battleSettings,
    updateBattleSetting,
    exportToClipboard,
    importFromClipboard,
    exportData,
    importData,
    resetToLastImport,
    clearAll,
    cardDB,
    cardTexts,
    characterDB,
    characterTexts,
    isLoading,
  }

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>
}

// Custom hook to use the deck context
export function useDeck() {
  const context = useContext(DeckContext)
  if (context === undefined) {
    throw new Error("useDeck must be used within a DeckProvider")
  }
  return context
}

