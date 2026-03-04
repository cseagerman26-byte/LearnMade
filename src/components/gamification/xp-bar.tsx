"use client"

import { cn } from "@/lib/utils"

interface XPBarProps {
  currentXP: number
  level: number
  progress: number
  xpForNext: number
  className?: string
}

export function XPBar({ currentXP, level, progress, xpForNext, className }: XPBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {level}
          </div>
          <span className="font-medium">Level {level}</span>
        </div>
        <span className="text-muted-foreground">
          {currentXP} / {xpForNext} XP
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
