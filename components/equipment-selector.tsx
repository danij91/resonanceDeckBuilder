"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import type { Equipment } from "../types"

interface EquipmentSelectorProps {
  type: "weapon" | "armor" | "accessory"
  onSelect: (equipId: string | null) => void
  onClose: () => void
  getTranslatedString: (key: string) => string
  equipments?: Equipment[] // Make equipments optional
}

export function EquipmentSelector({
  type,
  onSelect,
  onClose,
  getTranslatedString,
  equipments = [], // Provide default empty array
}: EquipmentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "quality">("quality")
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc")
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([])

  // 디버깅 로그 추가
  console.log("EquipmentSelector - type:", type)
  console.log("EquipmentSelector - equipments:", equipments)

  // 장비 필터링 및 정렬 로직을 useEffect로 분리
  useEffect(() => {
    if (!equipments || equipments.length === 0) {
      console.log("No equipments available")
      setFilteredEquipments([])
      return
    }

    // 타입별 필터링
    let filtered = equipments.filter((equip) => equip.type === type)

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter((equip) =>
        getTranslatedString(equip.name).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      let result = 0

      if (sortBy === "name") {
        result = getTranslatedString(a.name).localeCompare(getTranslatedString(b.name))
      } else {
        // Sort by quality (Orange > Golden > Purple > Blue > White)
        const qualityOrder = {
          Orange: 5,
          Golden: 4,
          Purple: 3,
          Blue: 2,
          Green: 1,
          White: 0,
        }
        result =
          (qualityOrder[b.quality as keyof typeof qualityOrder] || 0) -
          (qualityOrder[a.quality as keyof typeof qualityOrder] || 0)
      }

      // Apply sort direction
      return sortDirection === "asc" ? result : -result
    })

    console.log(`Filtered ${filtered.length} equipments of type ${type}`)
    setFilteredEquipments(sorted)
  }, [equipments, type, searchTerm, sortBy, sortDirection, getTranslatedString])

  // Function to get quality background color
  const getQualityBgColor = (quality: string) => {
    switch (quality) {
      case "Orange":
        return "bg-gradient-to-br from-orange-500 to-red-500"
      case "Golden":
        return "bg-gradient-to-br from-yellow-500 to-amber-500"
      case "Purple":
        return "bg-gradient-to-br from-purple-500 to-indigo-500"
      case "Blue":
        return "bg-gradient-to-br from-blue-500 to-cyan-500"
      case "Green":
        return "bg-gradient-to-br from-green-500 to-emerald-500"
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-500"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-800 p-4 rounded-lg max-w-3xl max-h-[80vh] w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-4">
            {getTranslatedString(`select_${type}`) || `Select ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </h3>

          {/* Search and sort controls */}
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getTranslatedString("search_equipment") || "Search equipment"}
                className="w-full pl-8 pr-4 py-2 h-10 bg-gray-700 border border-gray-600 rounded-md text-sm"
              />
            </div>

            <div className="flex h-10">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "quality")}
                className="p-2 h-full bg-gray-700 border border-gray-600 border-r-0 rounded-l-md text-sm appearance-none pl-3 pr-8"
                style={{ WebkitAppearance: "none" }}
              >
                <option value="quality">{getTranslatedString("sort_by_quality") || "Sort by Quality"}</option>
                <option value="name">{getTranslatedString("sort_by_name") || "Sort by Name"}</option>
              </select>

              <div className="h-full w-px bg-gray-600"></div>

              <button
                onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="h-full px-3 bg-gray-700 border border-gray-600 border-l-0 rounded-r-md flex items-center justify-center"
                aria-label={sortDirection === "asc" ? "Sort Descending" : "Sort Ascending"}
              >
                {sortDirection === "desc" ? "↓" : "↑"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* None option */}
            <div onClick={() => onSelect(null)} className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center cursor-pointer hover:bg-gray-600">
                <span className="text-lg">✕</span>
              </div>
              <div className="text-xs font-medium text-center">{getTranslatedString("none") || "None"}</div>
            </div>

            {/* Equipment items */}
            {filteredEquipments.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-400">
                {getTranslatedString("no_equipment_found") || "No equipment found"}
              </div>
            ) : (
              filteredEquipments.map((equipment) => (
                <div
                  key={equipment.id}
                  onClick={() => onSelect(equipment.id.toString())}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div
                    className={`w-full aspect-square ${getQualityBgColor(equipment.quality)} rounded-lg mb-2 overflow-hidden`}
                  >
                    <img
                      src={equipment.url || `/placeholder.svg?height=100&width=100`}
                      alt={getTranslatedString(equipment.name)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs font-medium text-center truncate w-full">
                    {getTranslatedString(equipment.name)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
            {getTranslatedString("close") || "Close"}
          </button>
        </div>
      </div>
    </div>
  )
}

