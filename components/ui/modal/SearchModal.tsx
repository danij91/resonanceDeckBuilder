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

  return (
    <Modal {...modalProps}>
      <div className="p-4" style={{ backgroundColor: "var(--modal-footer-bg)" }}>
        {/* 검색 및 정렬 컨트롤 */}
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
            {sortDirection === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {modalProps.children}
    </Modal>
  )
}

