import { User } from "@prisma/client"
import { XPBar } from "@/components/gamification/xp-bar"
import { StreakCounter } from "@/components/gamification/streak-counter"

interface HeaderProps {
  user: User
  totalXP: number
  level: number
  xpForNext: number
  progress: number
  streak: number
}

export function Header({ user, totalXP, level, xpForNext, progress, streak }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Welcome back, {user.name?.split(" ")[0]}!</h1>
        <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">
          {user.role}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {user.role === "STUDENT" && (
          <>
            <StreakCounter streak={streak} />
            <XPBar
              currentXP={totalXP}
              level={level}
              xpForNext={xpForNext}
              progress={progress}
              className="w-48"
            />
          </>
        )}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
