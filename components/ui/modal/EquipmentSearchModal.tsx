"use client"
import { SearchModal, type SearchModalProps } from "./SearchModal"
import type { Equipment } from "../../../types"

export interface EquipmentSearchModalProps extends Omit<SearchModalProps, "children"> {
  equipments: Equipment[]
  onSelectEquipment: (equipId: string | null) => void
  getTranslatedString: (key: string) => string
  type: "weapon" | "armor" | "accessory"
}

export function EquipmentSearchModal({
  equipments,
  onSelectEquipment,
  getTranslatedString,
  type,
  ...searchModalProps
}: EquipmentSearchModalProps) {
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
    <SearchModal {...searchModalProps}>
      <div className="flex-grow overflow-y-auto p-4" style={{ backgroundColor: "var(--modal-content-bg)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* None option */}
          <div onClick={() => onSelectEquipment(null)} className="flex flex-col items-center">
            <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center cursor-pointer hover:bg-gray-600 neon-border">
              <span className="text-lg neon-text">✕</span>
            </div>
            <div className="text-xs font-medium text-center neon-text">{getTranslatedString("none") || "None"}</div>
          </div>

          {/* Equipment items */}
          {equipments.length === 0 ? (
            <div className="col-span-full text-center py-4 text-gray-400">
              {getTranslatedString("no_equipment_found") || "No equipment found"}
            </div>
          ) : (
            equipments.map((equipment) => (
              <div
                key={equipment.id}
                onClick={() => onSelectEquipment(equipment.id.toString())}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className={`w-full aspect-square equipment-card ${getQualityBgColor(equipment.quality)}`}>
                  <img
                    src={equipment.url || `/placeholder.svg?height=100&width=100`}
                    alt={getTranslatedString(equipment.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-medium text-center truncate w-full neon-text">
                  {getTranslatedString(equipment.name)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SearchModal>
  )
}

