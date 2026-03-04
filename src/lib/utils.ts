import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function calculateLevel(xp: number): { level: number; xpForNext: number; progress: number } {
  const levels = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 250 },
    { level: 4, xp: 450 },
    { level: 5, xp: 700 },
    { level: 6, xp: 1000 },
    { level: 7, xp: 1400 },
    { level: 8, xp: 1900 },
    { level: 9, xp: 2500 },
    { level: 10, xp: 3200 },
  ]

  let currentLevel = 1
  let xpForNext = 100

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      currentLevel = levels[i].level
      xpForNext = levels[i + 1]?.xp || levels[i].xp + 500
      break
    }
  }

  const xpInLevel = xp - levels[currentLevel - 1].xp
  const xpNeeded = xpForNext - levels[currentLevel - 1].xp
  const progress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  return { level: currentLevel, xpForNext, progress }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
