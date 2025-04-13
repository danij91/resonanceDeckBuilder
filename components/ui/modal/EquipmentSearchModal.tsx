"use client"
import { useState, useMemo } from "react"
import { SearchModal, type SearchModalProps } from "./SearchModal"
import type { Equipment } from "../../../types"
// 필요한 import 추가
import { Info } from "lucide-react"
import { EquipmentDetailsModal } from "../../../components/equipment-details-modal"

// props 타입 업데이트
export interface EquipmentSearchModalProps extends Omit<SearchModalProps, "children" | "searchControl"> {
  equipments: Equipment[]
  onSelectEquipment: (equipId: string | null) => void
  getTranslatedString: (key: string) => string
  type: "weapon" | "armor" | "accessory"
  getSkill?: (skillId: number) => any
}

export function EquipmentSearchModal({
  equipments,
  onSelectEquipment,
  getTranslatedString,
  type,
  getSkill,
  ...searchModalProps
}: EquipmentSearchModalProps) {
  // 검색 및 정렬 상태 관리
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"quality" | "name">("quality")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // EquipmentSearchModal 컴포넌트 내부에 상태 추가
  const [showEquipmentDetails, setShowEquipmentDetails] = useState<string | null>(null)

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  // 정렬 기준 변경 핸들러
  const handleSortByChange = (value: string) => {
    setSortBy(value as "quality" | "name")
  }

  // 정렬 방향 변경 핸들러
  const handleSortDirectionChange = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  // 필터링 및 정렬된 장비 목록
  const filteredEquipments = useMemo(() => {
    // 검색어로 필터링
    const filtered = equipments.filter((equipment) =>
      getTranslatedString(equipment.name).toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // 정렬
    return [...filtered].sort((a, b) => {
      let result = 0

      if (sortBy === "name") {
        // 이름으로 정렬
        result = getTranslatedString(a.name).localeCompare(getTranslatedString(b.name))
      } else {
        // 품질로 정렬 (Orange > Golden > Purple > Blue > Green)
        const qualityOrder: Record<string, number> = {
          Orange: 5,
          Golden: 4,
          Purple: 3,
          Blue: 2,
          Green: 1,
        }

        result = (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0)
      }

      // 정렬 방향 적용
      return sortDirection === "asc" ? -result : result
    })
  }, [equipments, searchTerm, sortBy, sortDirection, getTranslatedString])

  // Function to get quality background color
  const getQualityBgColor = (quality: string) => {
    switch (quality) {
      case "Orange":
        return "bg-gradient-to-br from-orange-500 to-red-500 bg-opacity-70"
      case "Golden":
        return "bg-gradient-to-br from-yellow-500 to-amber-500 bg-opacity-70"
      case "Purple":
        return "bg-gradient-to-br from-purple-500 to-indigo-500 bg-opacity-70"
      case "Blue":
        return "bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-70"
      case "Green":
        return "bg-gradient-to-br from-green-500 to-emerald-500 bg-opacity-70"
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-500 bg-opacity-70"
    }
  }

  return (
    <>
      <SearchModal
        {...searchModalProps}
        searchControl={{
          searchTerm,
          onSearchChange: handleSearchChange,
          sortBy,
          onSortByChange: handleSortByChange,
          sortDirection,
          onSortDirectionChange: handleSortDirectionChange,
          sortOptions: [
            { value: "quality", label: getTranslatedString("sort_by_quality") || "Sort by Quality" },
            { value: "name", label: getTranslatedString("sort_by_name") || "Sort by Name" },
          ],
          searchPlaceholder: getTranslatedString("search_equipment") || "Search equipment",
        }}
        closeOnOutsideClick={true}
      >
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {/* None option */}
            <div onClick={() => onSelectEquipment(null)} className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-700 rounded-lg mb-1 flex items-center justify-center cursor-pointer hover:bg-gray-600 neon-border">
                <span className="text-lg neon-text">✕</span>
              </div>
              <div className="text-xs font-medium text-center truncate neon-text max-w-full">
                {getTranslatedString("none") || "None"}
              </div>
            </div>

            {/* Equipment items */}
            {filteredEquipments.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-400">
                {getTranslatedString("no_equipment_found") || "No equipment found"}
              </div>
            ) : (
              filteredEquipments.map((equipment) => (
                <div key={equipment.id} className="flex flex-col items-center cursor-pointer relative">
                  <div
                    className={`w-full aspect-square equipment-card ${getQualityBgColor(equipment.quality)} relative`}
                    onClick={() => onSelectEquipment(equipment.id.toString())}
                  >
                    {equipment.url ? (
                      <img
                        src={equipment.url || "/placeholder.svg"}
                        alt={getTranslatedString(equipment.name)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 이미지 로드 실패 시 기본 텍스트 표시
                          e.currentTarget.style.display = "none"
                          e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center")
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-center">
                          {getTranslatedString(equipment.name).substring(0, 2)}
                        </span>
                      </div>
                    )}

                    {/* 장비 정보 버튼 추가 - 검색창에서는 모바일에서도 표시 */}
                    <button
                      className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-0.5 sm:p-1 flex items-center justify-center z-10"
                      onClick={(e) => {
                        e.preventDefault() // 기본 동작 방지
                        e.stopPropagation() // 이벤트 전파 방지
                        setShowEquipmentDetails(equipment.id.toString())
                      }}
                    >
                      <Info className="w-7 h-7 text-white" />
                    </button>
                  </div>
                  <div
                    className="text-xs font-medium text-center truncate w-full neon-text max-w-full"
                    onClick={() => onSelectEquipment(equipment.id.toString())}
                  >
                    {getTranslatedString(equipment.name)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SearchModal>

      {/* 장비 상세 정보 모달 */}
      {showEquipmentDetails && (
        <EquipmentDetailsModal
          isOpen={!!showEquipmentDetails}
          onClose={() => {
            setShowEquipmentDetails(null)
          }}
          equipment={equipments.find((e) => e.id.toString() === showEquipmentDetails)!}
          getTranslatedString={getTranslatedString}
          getSkill={getSkill}
        />
      )}
    </>
  )
}
