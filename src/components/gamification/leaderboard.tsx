import { Trophy, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  level: number
  avatar?: string
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  className?: string
}

export function Leaderboard({ entries, className }: LeaderboardProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {entries.map((entry) => (
        <div
          key={entry.rank}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors",
            entry.isCurrentUser
              ? "bg-violet-100 border-2 border-violet-500"
              : "bg-card hover:bg-accent"
          )}
        >
          <div className="w-8 text-center">
            {entry.rank === 1 ? (
              <Trophy className="h-6 w-6 text-amber-500 mx-auto" />
            ) : entry.rank === 2 ? (
              <Medal className="h-6 w-6 text-gray-400 mx-auto" />
            ) : entry.rank === 3 ? (
              <Medal className="h-6 w-6 text-amber-700 mx-auto" />
            ) : (
              <span className="font-bold text-muted-foreground">{entry.rank}</span>
            )}
          </div>
          
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {entry.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{entry.name}</p>
            <p className="text-xs text-muted-foreground">Level {entry.level}</p>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-violet-600">{entry.xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>
      ))}
    </div>
  )
}
