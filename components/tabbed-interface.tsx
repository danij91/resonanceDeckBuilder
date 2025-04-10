"use client"

import { useState, type ReactNode } from "react"

interface Tab {
  id: string
  label: string
  content: ReactNode
}

// TabbedInterface에 onTabChange 콜백 추가
interface TabbedInterfaceProps {
  tabs: Tab[]
  defaultTabId?: string
  isPhotoMode?: boolean
  onTabChange?: (tabId: string) => void // 탭 변경 콜백 추가
}

export function TabbedInterface({ tabs, defaultTabId, isPhotoMode = false, onTabChange }: TabbedInterfaceProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id)

  // 탭 변경 시 콜백 호출
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId)
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  // 현재 활성화된 탭 찾기
  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  return (
    <div className="w-full">
      {/* 사진 모드가 아닐 때만 탭 버튼 표시 */}
      {!isPhotoMode && (
        <div className="flex border-b border-[hsla(var(--neon-white),0.3)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTabId === tab.id
                  ? "border-b-2 border-[hsl(var(--neon-white))] text-[hsl(var(--neon-white))] neon-text"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4">{tabs.find((tab) => tab.id === activeTabId)?.content}</div>
    </div>
  )
}
