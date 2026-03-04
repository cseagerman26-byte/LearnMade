"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaderboard as LeaderboardComponent } from "@/components/gamification/leaderboard"
import { Trophy, Medal, Users } from "lucide-react"
import { useSession } from "next-auth/react"

interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  level: number
  isCurrentUser?: boolean
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchLeaderboard(selectedClass)
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes")
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
        if (data.length > 0) {
          setSelectedClass(data[0].id)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async (classId: string) => {
    try {
      const res = await fetch(`/api/leaderboard?classId=${classId}`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(
          data.map((entry: any, idx: number) => ({
            rank: idx + 1,
            name: entry.student.name || "Unknown",
            xp: entry.totalXP,
            level: entry.level,
            isCurrentUser: entry.student.id === session?.user?.id,
          }))
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading leaderboard...</div>
  }

  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          See how you rank against your classmates
        </p>
      </div>

      {classes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No data yet</h2>
            <p className="text-muted-foreground">
              Complete quizzes to appear on the leaderboard
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree[1] && (
                <Card className="md:order-1 bg-gradient-to-b from-gray-100 to-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold">
                      {topThree[1].name.charAt(0)}
                    </div>
                    <Medal className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="font-bold text-lg">{topThree[1].name}</p>
                    <p className="text-gray-600">Level {topThree[1].level}</p>
                    <p className="text-2xl font-bold text-gray-500 mt-2">
                      {topThree[1].xp.toLocaleString()} XP
                    </p>
                  </CardContent>
                </Card>
              )}
              {topThree[0] && (
                <Card className="md:order-2 bg-gradient-to-b from-amber-100 to-amber-200">
                  <CardContent className="p-6 text-center">
                    <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-amber-400 flex items-center justify-center text-3xl font-bold text-white">
                      {topThree[0].name.charAt(0)}
                    </div>
                    <Trophy className="h-10 w-10 mx-auto text-amber-500 mb-2" />
                    <p className="font-bold text-xl">{topThree[0].name}</p>
                    <p className="text-amber-700">Level {topThree[0].level}</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">
                      {topThree[0].xp.toLocaleString()} XP
                    </p>
                  </CardContent>
                </Card>
              )}
              {topThree[2] && (
                <Card className="md:order-3 bg-gradient-to-b from-orange-100 to-orange-200">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-orange-300 flex items-center justify-center text-2xl font-bold">
                      {topThree[2].name.charAt(0)}
                    </div>
                    <Medal className="h-8 w-8 mx-auto text-orange-400 mb-2" />
                    <p className="font-bold text-lg">{topThree[2].name}</p>
                    <p className="text-orange-700">Level {topThree[2].level}</p>
                    <p className="text-2xl font-bold text-orange-500 mt-2">
                      {topThree[2].xp.toLocaleString()} XP
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Full Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardComponent entries={rest} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
