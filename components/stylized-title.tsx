"use client"

interface StylizedTitleProps {
  mainText: string
  subText: string
}

// Fix the title text rendering issue by simplifying the component
export function StylizedTitle({ mainText, subText }: StylizedTitleProps) {
  return (
    <div className="flex items-center relative cursor-pointer">
      {/* Horizontal line */}
      <div className="absolute w-full h-px bg-[hsl(var(--neon-white))] opacity-30 top-1/2 -z-10"></div>

      {/* Main title - simplified to avoid text overlap issues */}
      <h1 className="text-4xl font-black tracking-wider text-[hsl(var(--neon-white))] neon-text whitespace-nowrap">
        {mainText}
      </h1>

      {/* Subtitle - with white neon effect */}
      <div className="text-sm tracking-wider font-semibold text-[hsl(var(--neon-white))] ml-3 neon-text">{subText}</div>
    </div>
  )
}
