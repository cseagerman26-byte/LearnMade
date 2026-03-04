"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Save, GripVertical } from "lucide-react"
import { useSession } from "next-auth/react"

interface Class {
  id: string
  name: string
}

interface Question {
  id: string
  text: string
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER"
  options: string[]
  correctAnswer: string
  points: number
}

export default function CreateQuizPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [xpValue, setXpValue] = useState(10)
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    const res = await fetch("/api/classes")
    if (res.ok) {
      const data = await res.json()
      setClasses(data)
    }
  }

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type,
      options: type === "MCQ" ? ["", "", "", ""] : type === "TRUE_FALSE" ? ["True", "False"] : [],
      correctAnswer: "",
      points: 1,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    )
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[index] = value
          return { ...q, options: newOptions }
        }
        return q
      })
    )
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const saveQuiz = async () => {
    if (!selectedClass || !title || questions.length === 0) return
    setSaving(true)

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          title,
          description,
          xpValue,
          timeLimit,
          questions,
        }),
      })

      if (res.ok) {
        router.push("/dashboard/classes")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Create Quiz</h1>
        <p className="text-muted-foreground">Build an engaging quiz for your students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Choose a class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>XP Reward</Label>
              <Input
                type="number"
                value={xpValue}
                onChange={(e) => setXpValue(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quiz Title</Label>
            <Input
              placeholder="e.g., Chapter 5 Test"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Instructions for students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Time Limit (minutes, optional)</Label>
            <Input
              type="number"
              placeholder="No limit"
              value={timeLimit || ""}
              onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
              min={1}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-24"
                  onClick={() => {
                    addQuestion("MCQ")
                  }}
                >
                  <div className="text-center">
                    <div className="font-medium">Multiple Choice</div>
                    <div className="text-xs text-muted-foreground">4 options</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-24"
                  onClick={() => {
                    addQuestion("TRUE_FALSE")
                  }}
                >
                  <div className="text-center">
                    <div className="font-medium">True/False</div>
                    <div className="text-xs text-muted-foreground">2 options</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-24"
                  onClick={() => {
                    addQuestion("SHORT_ANSWER")
                  }}
                >
                  <div className="text-center">
                    <div className="font-medium">Short Answer</div>
                    <div className="text-xs text-muted-foreground">Manual grading</div>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No questions yet. Add your first question to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className="flex-1">
                  <CardTitle className="text-base">
                    Question {index + 1}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({question.type.replace("_", " ")})
                    </span>
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question..."
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                  />
                </div>

                {question.type === "MCQ" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === option}
                          onChange={() =>
                            updateQuestion(question.id, "correctAnswer", option)
                          }
                          className="h-4 w-4"
                        />
                        <Input
                          placeholder={`Option ${optIndex + 1}`}
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, optIndex, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {question.type === "TRUE_FALSE" && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <div className="flex gap-4">
                      {["True", "False"].map((option) => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === option}
                            onChange={() =>
                              updateQuestion(question.id, "correctAnswer", option)
                            }
                            className="h-4 w-4"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {question.type === "SHORT_ANSWER" && (
                  <div className="space-y-2">
                    <Label>Expected Answer (for reference)</Label>
                    <Input
                      placeholder="Model answer..."
                      value={question.correctAnswer}
                      onChange={(e) =>
                        updateQuestion(question.id, "correctAnswer", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    className="w-20"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(
                        question.id,
                        "points",
                        parseInt(e.target.value) || 1
                      )
                    }
                    min={1}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={saveQuiz} disabled={saving || !selectedClass || !title || questions.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Quiz"}
        </Button>
      </div>
    </div>
  )
}
