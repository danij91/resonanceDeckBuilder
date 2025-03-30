"use client"

import { useEffect, useState } from "react"

interface StylizedTitleProps {
  mainText: string
  subText: string
}

export function StylizedTitle({ mainText, subText }: StylizedTitleProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Optional: Add a hover animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-start relative">
      {/* Horizontal line */}
      <div className="absolute w-full h-px bg-gray-600 top-1/2 -z-10"></div>

      {/* Main title with glitch effect */}
      <div className="relative">
        {/* Shadow/blur copies for the glitch effect */}
        <div className={`absolute top-0 left-0 w-full h-full ${isAnimating ? "animate-pulse" : ""}`}>
          <div className="absolute -left-[2px] top-0 text-3xl font-black tracking-wider text-gray-500 opacity-70 blur-[2px]">
            {mainText}
          </div>
          <div className="absolute -left-[1px] top-0 text-3xl font-black tracking-wider text-gray-400 opacity-70 blur-[1px]">
            {mainText}
          </div>
          <div className="absolute left-[1px] top-0 text-3xl font-black tracking-wider text-gray-400 opacity-70 blur-[1px]">
            {mainText}
          </div>
          <div className="absolute left-[2px] top-0 text-3xl font-black tracking-wider text-gray-500 opacity-70 blur-[2px]">
            {mainText}
          </div>
        </div>

        {/* Main text */}
        <h1 className="text-3xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 drop-shadow-md">
          {mainText}
        </h1>
      </div>

      {/* Subtitle - now positioned below the main text */}
      <div className="text-xs tracking-[0.2em] font-semibold text-gray-300 mt-1">{subText}</div>
    </div>
  )
}

