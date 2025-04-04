"use client"

import type React from "react"
import { Search } from "lucide-react"
import { Modal, type ModalProps } from "./Modal"

export interface SearchControlProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
  sortDirection: "asc" | "desc"
  onSortDirectionChange: () => void
  sortOptions: { value: string; label: string }[]
  searchPlaceholder?: string
}

export interface SearchModalProps extends Omit<ModalProps, "children"> {
  searchControl: SearchControlProps
  children: React.ReactNode
}

export function SearchModal({ searchControl, ...modalProps }: SearchModalProps) {
  const {
    searchTerm,
    onSearchChange,
    sortBy,
    onSortByChange,
    sortDirection,
    onSortDirectionChange,
    sortOptions,
    searchPlaceholder = "Search...",
  } = searchControl

  // 검색 컨트롤을 모달 타이틀로 이동
  const enhancedTitle = (
    <>
      {modalProps.title}
      <div className="w-full mt-4 border-t border-[hsla(var(--neon-white),0.2)] pt-4">
        <div className="search-control">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="search-input pl-8 w-full"
            />
          </div>

          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} className="sort-select">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={onSortDirectionChange}
            className="sort-direction"
            aria-label={sortDirection === "asc" ? "Sort Descending" : "Sort Ascending"}
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <Modal {...modalProps} title={enhancedTitle}>
      {/* 내용 영역 */}
      {modalProps.children}
    </Modal>
  )
}

