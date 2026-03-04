"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakCounterProps {
  streak: number
  className?: string
}

export function StreakCounter({ streak, className }: StreakCounterProps) {
  const isActive = streak > 0

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        isActive
          ? "bg-orange-100 text-orange-600"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Flame
        className={cn(
          "h-5 w-5",
          isActive && "animate-pulse text-orange-500"
        )}
        fill={isActive ? "currentColor" : "none"}
      />
      <span className="font-bold">{streak}</span>
      <span className="text-sm">day streak</span>
    </div>
  )
}
