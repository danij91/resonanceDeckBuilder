"use client"

import type React from "react"
import { useState } from "react"
import { Modal, type ModalProps } from "./Modal"

export interface TabItem {
  id: string
  label: React.ReactNode
  content: React.ReactNode
}

export interface TabModalProps extends Omit<ModalProps, "children" | "title"> {
  tabs: TabItem[]
  initialTabId?: string
}

export function TabModal({ tabs, initialTabId, ...modalProps }: TabModalProps) {
  const [activeTabId, setActiveTabId] = useState(initialTabId || tabs[0]?.id || "")

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0]

  return (
    <Modal
      {...modalProps}
      title={
        <div className="flex w-full border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`character-detail-tab w-full py-3 px-0 text-center whitespace-nowrap transition-all ${
                activeTabId === tab.id
                  ? "border-b-2 border-white text-white font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
              style={{ margin: 0 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="min-h-[400px]">{activeTab?.content}</div>
    </Modal>
  )
}

