"use client"

import type { Equipment } from "../types"

interface EquipmentDetailsProps {
  equipment: Equipment
  getTranslatedString: (key: string) => string
  onClose: () => void
}

export function EquipmentDetails({ equipment, getTranslatedString, onClose }: EquipmentDetailsProps) {
  // Function to get rarity background color
  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case "UR":
        return "bg-gradient-to-br from-orange-500 to-amber-500"
      case "SSR":
        return "bg-gradient-to-br from-yellow-500 to-amber-500"
      case "SR":
        return "bg-gradient-to-br from-purple-500 to-indigo-500"
      case "R":
        return "bg-gradient-to-br from-blue-500 to-cyan-500"
      default:
        return "bg-gray-700"
    }
  }

  // Function to get equipment type name
  const getEquipmentTypeName = (type: string) => {
    switch (type) {
      case "weapon":
        return getTranslatedString("equipment.type.weapon") || "Weapon"
      case "armor":
        return getTranslatedString("equipment.type.armor") || "Armor"
      case "acc":
        return getTranslatedString("equipment.type.accessory") || "Accessory"
      default:
        return type
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{getTranslatedString("equipment.details") || "Equipment Details"}</h2>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          <div className="flex flex-col items-center mb-6">
            <div className={`w-32 h-32 ${getRarityBgColor(equipment.rarity)} rounded-lg overflow-hidden mb-3`}>
              {equipment.url ? (
                <img
                  src={equipment.url || "/placeholder.svg"}
                  alt={getTranslatedString(equipment.name)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg">{getTranslatedString(equipment.name).charAt(0)}</span>
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold">{getTranslatedString(equipment.name)}</h3>

            <div className="flex items-center mt-2 space-x-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getRarityBgColor(equipment.rarity)}`}
              >
                {equipment.rarity}
              </span>
              <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">{getEquipmentTypeName(equipment.type)}</span>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              {getTranslatedString("equipment.description") || "Description"}
            </h4>
            <p className="text-white">{getTranslatedString(equipment.desc)}</p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
            {getTranslatedString("close") || "Close"}
          </button>
        </div>
      </div>
    </div>
  )
}

