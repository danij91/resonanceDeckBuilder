"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ClipboardCopy, ClipboardPaste, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useDeck } from "@/contexts/deck-context"
import { useToast } from "@/hooks/use-toast"

export default function LanguageSelector() {
  const [activeTab, setActiveTab] = useState("en")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { exportToClipboard, importFromClipboard } = useDeck()
  const { toast } = useToast()

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "ja", label: "日本語" },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportToClipboard()
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      await importFromClipboard()
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full md:w-1/2">
        <TabsList className="grid grid-cols-5 w-full">
          {languages.map((lang) => (
            <TabsTrigger key={lang.value} value={lang.value}>
              {lang.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                )}
                Export to Clipboard
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy deck configuration to clipboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleImport} disabled={isImporting}>
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                )}
                Import from Clipboard
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paste deck configuration from clipboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

