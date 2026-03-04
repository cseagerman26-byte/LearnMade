"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Timer, Zap, CheckCircle, XCircle, ArrowRight } from "lucide-react"

interface Question {
  id: string
  text: string
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER"
  options: string[]
  points: number
}

interface Assignment {
  id: string
  title: string
  description: string
  xpValue: number
  timeLimit: number
  class: {
    name: string
    teacher: { name: string }
  }
  questions: Question[]
}

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; percentage: number; xpEarned: number } | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    fetchQuiz()
  }, [id])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, submitted])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/assignments?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.questions) {
          data.questions = data.questions.map((q: any) => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : []
          }))
        }
        setAssignment(data)
        if (data.timeLimit) {
          setTimeLeft(data.timeLimit * 60)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleSubmit = async () => {
    if (!assignment) return

    const score = assignment.questions.reduce((sum, q) => {
      const userAnswer = answers[q.id]
      if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
        return sum + (userAnswer === q.options[0] || userAnswer === "True" ? q.points : 0)
      }
      return sum
    }, 0)

    const totalPoints = assignment.questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = (score / totalPoints) * 100
    const xpEarned = Math.round((percentage / 100) * assignment.xpValue)

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          answers,
          score,
          percentage,
          xpEarned,
        }),
      })

      if (res.ok) {
        setResult({ score, percentage, xpEarned })
        setSubmitted(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return <div className="p-6">Loading quiz...</div>
  }

  if (!assignment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Quiz not found</p>
            <Button onClick={() => router.push("/dashboard/quizzes")} className="mt-4">
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-muted-foreground mb-6">
              {assignment.class.name}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{result.percentage.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {result.score}/{assignment.questions.reduce((s, q) => s + q.points, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <div className="p-4 bg-violet-100 rounded-lg">
                <p className="text-2xl font-bold text-violet-600">+{result.xpEarned}</p>
                <p className="text-sm text-violet-600">XP Earned</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button onClick={() => router.push("/dashboard/quizzes")}>
                More Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = assignment.questions[currentIndex]
  const progress = ((currentIndex + 1) / assignment.questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-muted-foreground">{assignment.class.name}</p>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-muted"}`}>
            <Timer className="h-5 w-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Question {currentIndex + 1} of {assignment.questions.length}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({currentQuestion.points} point{currentQuestion.points > 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{currentQuestion.text}</p>

          {currentQuestion.type === "MCQ" && (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-4 rounded-lg border transition-colors ${
                    answers[currentQuestion.id] === option
                      ? "border-violet-500 bg-violet-50"
                      : "hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "TRUE_FALSE" && (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              className="flex gap-4"
            >
              {["True", "False"].map((option) => (
                <div
                  key={option}
                  className={`flex-1 flex items-center justify-center p-4 rounded-lg border transition-colors ${
                    answers[currentQuestion.id] === option
                      ? "border-violet-500 bg-violet-50"
                      : "hover:bg-muted cursor-pointer"
                  }`}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="ml-2 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "SHORT_ANSWER" && (
            <Input
              placeholder="Type your answer..."
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        {currentIndex === assignment.questions.length - 1 ? (
          <Button onClick={handleSubmit}>
            Submit Quiz
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
