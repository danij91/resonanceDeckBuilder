"use client"

import { useState } from "react"
import Image from "next/image"
import { useDrop } from "react-dnd"
import { Plus, X, Info, ExternalLink, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useDeck, type Character } from "@/contexts/deck-context"

interface CharacterSlotProps {
  index: number
}

interface EquipmentSlotProps {
  slotIndex: number
  characterIndex: number
  equipment: any | null
  onRemove: () => void
  onAdd: () => void
}

// Sample character data
const sampleCharacters = [
  {
    id: 1,
    name: "Warrior",
    rank: "SSR",
    image: "/placeholder.svg?height=180&width=120",
    skills: [
      {
        id: 1,
        name: "Slash",
        image: "/placeholder.svg?height=50&width=50",
        description: "Deal physical damage to a single target.",
      },
      {
        id: 2,
        name: "Whirlwind",
        image: "/placeholder.svg?height=50&width=50",
        description: "Deal physical damage to all enemies.",
      },
      {
        id: 3,
        name: "Berserk",
        image: "/placeholder.svg?height=50&width=50",
        description: "Increase attack power for 3 turns.",
      },
    ],
    resonance: [
      {
        level: 1,
        name: "Warrior's Spirit",
        description: "Increases attack by 5%",
        traitName: "Combat Mastery",
        traitDescription: "Increases critical hit chance by 3%",
      },
      {
        level: 2,
        name: "Battle Hardened",
        description: "Increases defense by 5%",
        traitName: "Endurance",
        traitDescription: "Reduces damage taken by 3%",
      },
      {
        level: 3,
        name: "Weapon Expert",
        description: "Increases attack by 10%",
        traitName: "Weapon Mastery",
        traitDescription: "Increases attack speed by 5%",
      },
      {
        level: 4,
        name: "Veteran Fighter",
        description: "Increases HP by 10%",
        traitName: "Vitality",
        traitDescription: "Regenerates 1% HP each turn",
      },
      {
        level: 5,
        name: "Legendary Warrior",
        description: "Increases all stats by 10%",
        traitName: "Legend",
        traitDescription: "50% chance to resist status effects",
      },
    ],
    awakening: [
      { level: 1, name: "Awakened Strength", description: "Increases base attack by 10%" },
      { level: 2, name: "Awakened Defense", description: "Increases base defense by 10%" },
      { level: 3, name: "Awakened Vitality", description: "Increases base HP by 15%" },
      { level: 4, name: "Awakened Speed", description: "Increases base speed by 10%" },
      { level: 5, name: "Fully Awakened", description: "Unlocks special costume and increases all base stats by 15%" },
    ],
  },
  {
    id: 2,
    name: "Mage",
    rank: "SSR",
    image: "/placeholder.svg?height=180&width=120",
    skills: [
      {
        id: 1,
        name: "Fireball",
        image: "/placeholder.svg?height=50&width=50",
        description: "Deal magical damage to a single target.",
      },
      {
        id: 2,
        name: "Frost Nova",
        image: "/placeholder.svg?height=50&width=50",
        description: "Deal magical damage and freeze all enemies.",
      },
      {
        id: 3,
        name: "Arcane Burst",
        image: "/placeholder.svg?height=50&width=50",
        description: "Deal massive magical damage to all enemies.",
      },
    ],
    resonance: [
      {
        level: 1,
        name: "Arcane Insight",
        description: "Increases magic attack by 5%",
        traitName: "Spell Mastery",
        traitDescription: "Reduces spell cooldown by 3%",
      },
      {
        level: 2,
        name: "Mana Flow",
        description: "Increases mana regeneration by 5%",
        traitName: "Mana Efficiency",
        traitDescription: "Reduces mana cost by 3%",
      },
      {
        level: 3,
        name: "Elemental Mastery",
        description: "Increases elemental damage by 10%",
        traitName: "Elemental Affinity",
        traitDescription: "Increases elemental resistance by 5%",
      },
      {
        level: 4,
        name: "Archmage's Wisdom",
        description: "Increases magic critical rate by 10%",
        traitName: "Arcane Knowledge",
        traitDescription: "Increases magic critical damage by 15%",
      },
      {
        level: 5,
        name: "Legendary Mage",
        description: "Increases all magical stats by 10%",
        traitName: "Archmage",
        traitDescription: "20% chance to cast spells twice",
      },
    ],
    awakening: [
      { level: 1, name: "Awakened Magic", description: "Increases base magic attack by 10%" },
      { level: 2, name: "Awakened Mind", description: "Increases base mana by 10%" },
      { level: 3, name: "Awakened Focus", description: "Increases magic critical rate by 15%" },
      { level: 4, name: "Awakened Wisdom", description: "Increases magic defense by 10%" },
      {
        level: 5,
        name: "Fully Awakened",
        description: "Unlocks special costume and increases all magical stats by 15%",
      },
    ],
  },
  { id: 3, name: "Rogue", rank: "SR", image: "/placeholder.svg?height=180&width=120" },
  { id: 4, name: "Cleric", rank: "SR", image: "/placeholder.svg?height=180&width=120" },
  { id: 5, name: "Archer", rank: "SR", image: "/placeholder.svg?height=180&width=120" },
  { id: 6, name: "Paladin", rank: "SSR", image: "/placeholder.svg?height=180&width=120" },
  { id: 7, name: "Necromancer", rank: "SSR", image: "/placeholder.svg?height=180&width=120" },
  { id: 8, name: "Druid", rank: "SR", image: "/placeholder.svg?height=180&width=120" },
]

// Sample equipment data
const sampleEquipment = [
  { id: 1, name: "Steel Sword", rank: "SR", image: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Magic Staff", rank: "SSR", image: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Leather Armor", rank: "R", image: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Plate Mail", rank: "SR", image: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Healing Amulet", rank: "SSR", image: "/placeholder.svg?height=40&width=40" },
  { id: 6, name: "Dragon Shield", rank: "SSR", image: "/placeholder.svg?height=40&width=40" },
  { id: 7, name: "Mystic Orb", rank: "SR", image: "/placeholder.svg?height=40&width=40" },
  { id: 8, name: "Shadow Dagger", rank: "SR", image: "/placeholder.svg?height=40&width=40" },
  { id: 9, name: "Ancient Bow", rank: "SR", image: "/placeholder.svg?height=40&width=40" },
  { id: 10, name: "Divine Robe", rank: "SSR", image: "/placeholder.svg?height=40&width=40" },
]

const EquipmentSlot = ({ slotIndex, characterIndex, equipment, onRemove, onAdd }: EquipmentSlotProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "EQUIPMENT",
    drop: () => ({ type: "equipment", slotIndex, characterIndex }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const [showEquipmentList, setShowEquipmentList] = useState(false)

  const handleSelectEquipment = (selectedEquipment) => {
    onAdd(selectedEquipment)
    setShowEquipmentList(false)
  }

  return (
    <>
      <div
        ref={drop}
        className={`w-full aspect-square border-2 rounded-md flex items-center justify-center cursor-pointer ${
          isOver ? "border-primary bg-primary/10" : "border-dashed border-muted-foreground/50"
        }`}
        onClick={() => setShowEquipmentList(true)}
      >
        {equipment ? (
          <div className="relative w-full h-full p-1">
            <Image
              src={equipment.image || "/placeholder.svg?height=40&width=40"}
              alt={equipment.name || "Equipment"}
              fill
              className="object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Plus className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Equipment {slotIndex + 1}</span>
          </div>
        )}
      </div>

      {/* Equipment Selection Dialog */}
      <Dialog open={showEquipmentList} onOpenChange={setShowEquipmentList}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Equipment</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sampleEquipment.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleSelectEquipment(item)}
                >
                  <div className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-primary p-2 bg-muted/30">
                    <Image
                      src={item.image || "/placeholder.svg?height=40&width=40"}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="mt-1">
                    <p className="text-center text-xs font-medium truncate">{item.name}</p>
                    <Badge className="w-full flex justify-center mt-1" variant="secondary">
                      {item.rank}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function CharacterSlot({ index }: CharacterSlotProps) {
  const { characters, setCharacters, leaderId, setLeaderId } = useDeck()
  const [character, setCharacter] = useState<Character | null>(null)
  const [equipment, setEquipment] = useState<Array<any | null>>([null, null, null])
  const [showCharacterList, setShowCharacterList] = useState(false)
  const [showCharacterInfo, setShowCharacterInfo] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  const isLeader = character && leaderId === character.id

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CHARACTER",
    drop: () => ({ type: "character", index }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const handleAddCharacter = () => {
    setShowCharacterList(true)
  }

  const selectCharacter = (selectedCharacter) => {
    const newCharacter = {
      ...selectedCharacter,
      id: Date.now(),
    }

    setCharacter(newCharacter)

    // Update the global characters array
    const newCharacters = [...characters]
    newCharacters[index] = newCharacter
    setCharacters(newCharacters)

    setShowCharacterList(false)
  }

  const handleRemoveCharacter = () => {
    // If this character is the leader, clear the leader
    if (character && leaderId === character.id) {
      setLeaderId(null)
    }

    setCharacter(null)
    setEquipment([null, null, null])

    // Update the global characters array
    const newCharacters = [...characters]
    newCharacters[index] = null
    setCharacters(newCharacters)
  }

  const handleSetAsLeader = () => {
    if (character) {
      setLeaderId(character.id)
    }
  }

  const handleAddEquipment = (slotIndex: number, selectedEquipment = null) => {
    const newEquipment = [...equipment]

    if (selectedEquipment) {
      // Use the selected equipment from the dialog
      newEquipment[slotIndex] = {
        ...selectedEquipment,
        id: Date.now(),
      }
    } else {
      // Fallback to default equipment (should not happen with the new UI)
      newEquipment[slotIndex] = {
        id: Date.now(),
        name: `Equipment ${slotIndex + 1}`,
        image: `/placeholder.svg?height=40&width=40`,
      }
    }

    setEquipment(newEquipment)
  }

  const handleRemoveEquipment = (slotIndex: number) => {
    const newEquipment = [...equipment]
    newEquipment[slotIndex] = null
    setEquipment(newEquipment)
  }

  return (
    <>
      <Card
        className={`overflow-hidden transition-all ${isOver ? "ring-2 ring-primary" : ""} ${isLeader ? "ring-2 ring-amber-500" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-4">
            {/* Character Portrait */}
            <div
              className="relative w-full aspect-[3/4] bg-muted rounded-md flex items-center justify-center cursor-pointer"
              onClick={character ? () => setShowCharacterInfo(true) : handleAddCharacter}
            >
              {character ? (
                <div className="relative w-full h-full">
                  <Image
                    src={character.image || "/placeholder.svg"}
                    alt={character.name}
                    fill
                    className="object-cover rounded-md"
                  />

                  {/* Leader Crown Icon */}
                  {isLeader && (
                    <div className="absolute top-0 left-0 w-full bg-amber-500/80 text-black py-1 px-2 flex items-center justify-center">
                      <Crown className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Leader</span>
                    </div>
                  )}

                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveCharacter()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-black/30 hover:bg-black/50 border-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowCharacterInfo(true)
                            }}
                          >
                            <Info className="h-4 w-4 text-white" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Character Info</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {!isLeader && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-black/30 hover:bg-black/50 border-none"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetAsLeader()
                              }}
                            >
                              <Crown className="h-4 w-4 text-white" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Set as Leader</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              ) : (
                <div ref={drop}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12">
                          <Plus className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add Character</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {/* Equipment Slots - Always visible */}
            <div className="w-full grid grid-cols-3 gap-2">
              {equipment.map((item, slotIndex) => (
                <div key={slotIndex} className="relative">
                  <EquipmentSlot
                    slotIndex={slotIndex}
                    characterIndex={index}
                    equipment={item}
                    onRemove={() => handleRemoveEquipment(slotIndex)}
                    onAdd={(selectedEquipment) => handleAddEquipment(slotIndex, selectedEquipment)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Selection Dialog */}
      <Dialog open={showCharacterList} onOpenChange={setShowCharacterList}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Character</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sampleCharacters.map((char) => (
                <div
                  key={char.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => selectCharacter(char)}
                >
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden border-2 border-transparent hover:border-primary">
                    <Image src={char.image || "/placeholder.svg"} alt={char.name} fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                      <p className="text-center text-xs font-medium text-white">{char.name}</p>
                      <Badge className="w-full flex justify-center mt-1" variant="secondary">
                        {char.rank || "R"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Character Info Dialog */}
      {character && (
        <Dialog open={showCharacterInfo} onOpenChange={setShowCharacterInfo}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {character.name}
                {character.rank && <Badge variant="secondary">{character.rank}</Badge>}
                {isLeader && <Badge className="bg-amber-500 text-black">Leader</Badge>}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="awakening">Awakening & Resonance</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-0">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Character Image */}
                  <div className="w-full sm:w-1/3 space-y-2">
                    <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                      <Image
                        src={character.image || "/placeholder.svg"}
                        alt={character.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full
                      </Button>

                      {!isLeader && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={handleSetAsLeader}>
                          <Crown className="h-4 w-4 mr-2" />
                          Set as Leader
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Character Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      {character.name}
                      {character.rank && <Badge>{character.rank}</Badge>}
                    </h3>

                    {/* Skills */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Skills</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {character.skills
                          ? character.skills.map((skill, index) => (
                              <div key={skill.id} className="space-y-2">
                                <div className="relative aspect-square rounded-md overflow-hidden border border-muted">
                                  <Image
                                    src={skill.image || "/placeholder.svg?height=50&width=50"}
                                    alt={skill.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{skill.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {index === 2 ? "Ultimate" : `Skill ${index + 1}`}
                                  </p>
                                </div>
                              </div>
                            ))
                          : Array(3)
                              .fill(null)
                              .map((_, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {index === 2 ? "Ultimate" : `Skill ${index + 1}`}
                                  </p>
                                </div>
                              ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="awakening" className="mt-0">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {/* Resonance */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Resonance</h3>
                      {character.resonance ? (
                        <div className="space-y-4">
                          {character.resonance.map((res, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">Level {res.level}</Badge>
                                  <h4 className="font-medium">{res.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{res.description}</p>

                                {res.traitName && (
                                  <div className="mt-2 border-t pt-2">
                                    <p className="text-sm font-medium">{res.traitName}</p>
                                    <p className="text-xs text-muted-foreground">{res.traitDescription}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No resonance information available.</p>
                      )}
                    </div>

                    {/* Awakening */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Awakening</h3>
                      {character.awakening ? (
                        <div className="space-y-4">
                          {character.awakening.map((awaken, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">Level {awaken.level}</Badge>
                                  <h4 className="font-medium">{awaken.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">{awaken.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No awakening information available.</p>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

