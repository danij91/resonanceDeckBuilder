"use client"

import { useState } from "react"
import { X, Search, Filter, SortAsc } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DeckSearchProps {
  onClose: () => void
}

export default function DeckSearch({ onClose }: DeckSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("popular")

  // Mock data for demonstration
  const mockDecks = [
    { id: 1, name: "Ultimate Attack Deck", author: "GameMaster", likes: 245, tags: ["Attack", "PvP"] },
    { id: 2, name: "Defensive Strategy", author: "ShieldBearer", likes: 189, tags: ["Defense", "Survival"] },
    { id: 3, name: "Balanced Team Comp", author: "BalanceKeeper", likes: 312, tags: ["Balanced", "Team"] },
    { id: 4, name: "Speed Run Setup", author: "SpeedDemon", likes: 156, tags: ["Speed", "PvE"] },
    { id: 5, name: "Boss Killer", author: "BossHunter", likes: 278, tags: ["Boss", "PvE"] },
  ]

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Search Decks</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search decks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decks</SelectItem>
                  <SelectItem value="attack">Attack</SelectItem>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="pve">PvE</SelectItem>
                  <SelectItem value="pvp">PvP</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[130px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="my-decks">My Decks</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockDecks.map((deck) => (
              <Card key={deck.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{deck.name}</h3>
                      <p className="text-sm text-muted-foreground">by {deck.author}</p>
                    </div>
                    <Badge variant="secondary">{deck.likes} likes</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deck.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-2 flex justify-end">
                  <Button size="sm">View Deck</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

