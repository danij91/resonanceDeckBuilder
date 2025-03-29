"use client"

import { Minus, Plus } from "lucide-react"

interface BattleSettingsProps {
  settings: {
    isLeaderCardOn: boolean
    isSpCardOn: boolean
    keepCardNum: number
    discardType: number
    otherCard: number
  }
  onUpdateSettings: (settings: Partial<BattleSettingsProps["settings"]>) => void
  getTranslatedString: (key: string) => string
}

export function BattleSettings({ settings, onUpdateSettings, getTranslatedString }: BattleSettingsProps) {
  const handleIncrement = () => {
    if (settings.keepCardNum < 5) {
      onUpdateSettings({ keepCardNum: settings.keepCardNum + 1 })
    }
  }

  const handleDecrement = () => {
    if (settings.keepCardNum > 0) {
      onUpdateSettings({ keepCardNum: settings.keepCardNum - 1 })
    }
  }

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-bold mb-4">{getTranslatedString("battle.section.title") || "Battle Settings"}</h2>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Leader Skill Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="isLeaderCardOn" className="text-sm">
                {getTranslatedString("battle.leader.skill") || "Leader Skill"}
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="isLeaderCardOn"
                  checked={settings.isLeaderCardOn}
                  onChange={(e) => onUpdateSettings({ isLeaderCardOn: e.target.checked })}
                  className="opacity-0 w-0 h-0 absolute"
                />
                <label
                  htmlFor="isLeaderCardOn"
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    settings.isLeaderCardOn ? "bg-blue-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute left-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      settings.isLeaderCardOn ? "transform translate-x-6" : ""
                    }`}
                  />
                </label>
              </div>
            </div>

            {/* Ultimate Skill Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="isSpCardOn" className="text-sm">
                {getTranslatedString("battle.ultimate.skill") || "Ultimate Skill"}
              </label>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  id="isSpCardOn"
                  checked={settings.isSpCardOn}
                  onChange={(e) => onUpdateSettings({ isSpCardOn: e.target.checked })}
                  className="opacity-0 w-0 h-0 absolute"
                />
                <label
                  htmlFor="isSpCardOn"
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    settings.isSpCardOn ? "bg-blue-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute left-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      settings.isSpCardOn ? "transform translate-x-6" : ""
                    }`}
                  />
                </label>
              </div>
            </div>

            {/* Discard Conditions */}
            <div>
              <label htmlFor="discardType" className="block text-sm mb-2">
                {getTranslatedString("battle.discard.conditions") || "Discard Conditions"}
              </label>
              <select
                id="discardType"
                value={settings.discardType}
                onChange={(e) => onUpdateSettings({ discardType: Number.parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-700 bg-gray-800 rounded text-sm"
              >
                <option value={0}>{getTranslatedString("battle.discard.off") || "Off"}</option>
                <option value={1}>{getTranslatedString("battle.discard.auto") || "Auto"}</option>
                <option value={2}>{getTranslatedString("battle.discard.manual") || "Manual"}</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {/* Hand Retention */}
            <div>
              <label className="block text-sm mb-2">
                {getTranslatedString("battle.hand.retention") || "Hand Retention"}
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-l flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 h-8 bg-gray-800 border-t border-b border-gray-700 flex items-center justify-center">
                  {settings.keepCardNum}
                </div>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-r flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="ml-2 text-sm text-gray-400">{getTranslatedString("battle.cards") || "cards"}</span>
              </div>
            </div>

            {/* Enemy Priority */}
            <div>
              <label htmlFor="otherCard" className="block text-sm mb-2">
                {getTranslatedString("battle.enemy.priority") || "Enemy Priority"}
              </label>
              <select
                id="otherCard"
                value={settings.otherCard}
                onChange={(e) => onUpdateSettings({ otherCard: Number.parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-700 bg-gray-800 rounded text-sm"
              >
                <option value={0}>{getTranslatedString("battle.enemy.use.now") || "Use Now"}</option>
                <option value={1}>{getTranslatedString("battle.enemy.use.later") || "Use Later"}</option>
                <option value={2}>{getTranslatedString("battle.enemy.use.random") || "Random"}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

