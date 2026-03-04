"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { XPBar } from "@/components/gamification/xp-bar"
import { StreakCounter } from "@/components/gamification/streak-counter"
import { Trophy, Zap, Flame, Target, BookOpen } from "lucide-react"
import { useSession } from "next-auth/react"
import { calculateLevel } from "@/lib/utils"

interface XPEntry {
  id: string
  amount: number
  reason: string
  createdAt: string
}

export default function ProgressPage() {
  const { data: session } = useSession()
  const [xpLogs, setXpLogs] = useState<XPEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalXP: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
  })

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/progress")
      if (res.ok) {
        const data = await res.json()
        setXpLogs(data.xpLogs || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const { level, xpForNext, progress } = calculateLevel(stats.totalXP)

  if (loading) {
    return <div className="p-6">Loading progress...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground">Track your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100">Total XP</p>
                <p className="text-3xl font-bold">{stats.totalXP.toLocaleString()}</p>
              </div>
              <Zap className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100">Current Level</p>
                <p className="text-3xl font-bold">{level}</p>
              </div>
              <Trophy className="h-10 w-10 text-violet-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Quizzes Completed</p>
                <p className="text-3xl font-bold">{stats.quizzesCompleted}</p>
              </div>
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{stats.averageScore.toFixed(0)}%</p>
              </div>
              <Target className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
                {level}
              </div>
              <div className="flex-1">
                <XPBar
                  currentXP={stats.totalXP}
                  level={level}
                  xpForNext={xpForNext}
                  progress={progress}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {xpForNext - stats.totalXP} XP to Level {level + 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Streak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <StreakCounter streak={stats.currentStreak} className="text-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{stats.longestStreak}</p>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent XP Earned</CardTitle>
        </CardHeader>
        <CardContent>
          {xpLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Complete quizzes to earn XP
            </p>
          ) : (
            <div className="space-y-3">
              {xpLogs.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{entry.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Zap className="h-4 w-4" />
                    +{entry.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
