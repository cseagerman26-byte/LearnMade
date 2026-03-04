"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, Zap, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"

interface Assignment {
  id: string
  title: string
  xpValue: number
  class: {
    name: string
    teacher: { name: string }
  }
  _count: {
    questions: number
  }
}

export default function QuizzesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments")
      if (res.ok) {
        const data = await res.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading quizzes...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground">
          Complete quizzes to earn XP and level up!
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No quizzes available</h2>
            <p className="text-muted-foreground">
              Join a class to see quizzes from your teachers
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/quizzes/${assignment.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {assignment.class.name}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">{assignment._count.questions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">XP Reward</span>
                    <div className="flex items-center gap-1 text-amber-600">
                      <Zap className="h-4 w-4" />
                      <span className="font-bold">{assignment.xpValue}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Button className="w-full" size="sm">
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
