"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NumberInput from "@/components/number-input"
import { useDeck } from "@/contexts/deck-context"

export default function BattleSettingsSection() {
  const { battleSettings, updateBattleSetting } = useDeck()

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Battle Settings</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="leader-skill">Leader Skill Activation</Label>
                <Switch
                  id="leader-skill"
                  checked={battleSettings.leaderSkillActive}
                  onCheckedChange={(checked) => updateBattleSetting("leaderSkillActive", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ultimate-skill">Ultimate Skill Activation</Label>
                <Switch
                  id="ultimate-skill"
                  checked={battleSettings.ultimateSkillActive}
                  onCheckedChange={(checked) => updateBattleSetting("ultimateSkillActive", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discard-condition">Discard Conditions</Label>
                <Select
                  value={battleSettings.discardCondition}
                  onValueChange={(value) => updateBattleSetting("discardCondition", value)}
                >
                  <SelectTrigger id="discard-condition">
                    <SelectValue placeholder="Select discard condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hand-retention">Hand Retention</Label>
                <div className="flex items-center">
                  <NumberInput
                    value={battleSettings.handRetention}
                    onChange={(value) => updateBattleSetting("handRetention", value)}
                    min={1}
                    max={10}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Cards</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enemy-priority">Enemy Card Priority</Label>
                <Select
                  value={battleSettings.enemyCardPriority}
                  onValueChange={(value) => updateBattleSetting("enemyCardPriority", value)}
                >
                  <SelectTrigger id="enemy-priority">
                    <SelectValue placeholder="Select enemy card priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highest-attack">Highest Attack</SelectItem>
                    <SelectItem value="lowest-health">Lowest Health</SelectItem>
                    <SelectItem value="highest-threat">Highest Threat</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

