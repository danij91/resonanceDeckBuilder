"use client"
import CharacterSlot from "@/components/character-slot"

export default function CharacterSection() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Characters</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <CharacterSlot key={index} index={index} />
          ))}
      </div>
    </section>
  )
}

