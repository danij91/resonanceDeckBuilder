"use client"

import { useState } from "react"
import { X, Send, ThumbsUp, MessageSquare, Flag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface CommunityDiscussionProps {
  onClose: () => void
}

interface Comment {
  id: number
  author: string
  avatar: string
  content: string
  likes: number
  replies: number
  time: string
}

export default function CommunityDiscussion({ onClose }: CommunityDiscussionProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [newComment, setNewComment] = useState("")

  // Mock data for demonstration
  const mockComments: Comment[] = [
    {
      id: 1,
      author: "DeckMaster",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "I've found that using the Ultimate Skill Activation with a balanced team comp gives the best results against boss enemies.",
      likes: 24,
      replies: 5,
      time: "2 hours ago",
    },
    {
      id: 2,
      author: "StrategyGuru",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Has anyone tried the new character released last week? I'm wondering if it's worth adding to my deck.",
      likes: 18,
      replies: 12,
      time: "5 hours ago",
    },
    {
      id: 3,
      author: "GameExplorer",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "Just shared my speed run deck - managed to clear the dungeon in under 3 minutes! Check it out in the deck search.",
      likes: 42,
      replies: 8,
      time: "1 day ago",
    },
    {
      id: 4,
      author: "NewPlayer",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "I'm new to the game. Can someone recommend a good starter deck for PvE content?",
      likes: 7,
      replies: 15,
      time: "2 days ago",
    },
  ]

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // In a real app, this would add the comment to the database
      console.log("Submitting comment:", newComment)
      setNewComment("")
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Community Discussion</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="help">Help & Support</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1 px-1 py-4">
          <div className="space-y-6">
            {mockComments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={comment.avatar} alt={comment.author} />
                    <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{comment.author}</h4>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="mt-1 text-sm">{comment.content}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {comment.replies}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4">
          <div className="flex items-start gap-2">
            <Textarea
              placeholder="Add to the discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] flex-1"
            />
            <Button size="icon" onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

