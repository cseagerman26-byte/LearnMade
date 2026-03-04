"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, ArrowRight, Copy } from "lucide-react"
import { useSession } from "next-auth/react"

interface Class {
  id: string
  name: string
  subject: string
  joinCode: string
  _count: {
    enrollments: number
    assignments: number
  }
  teacher?: {
    name: string
  }
}

export default function ClassesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [newClass, setNewClass] = useState({ name: "", subject: "" })
  const [saving, setSaving] = useState(false)

  const isTeacher = session?.user?.role === "TEACHER"

  useState(() => {
    fetchClasses()
  })

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes")
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const createClass = async () => {
    if (!newClass.name) return
    setSaving(true)
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClass),
      })
      if (res.ok) {
        const cls = await res.json()
        setClasses([...classes, cls])
        setIsCreateOpen(false)
        setNewClass({ name: "", subject: "" })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const joinClass = async () => {
    if (!joinCode) return
    setSaving(true)
    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      })
      if (res.ok) {
        fetchClasses()
        setJoinCode("")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Classes</h1>
        {isTeacher && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input
                    placeholder="e.g., Mathematics 101"
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g., Mathematics"
                    value={newClass.subject}
                    onChange={(e) =>
                      setNewClass({ ...newClass, subject: e.target.value })
                    }
                  />
                </div>
                <Button onClick={createClass} disabled={saving} className="w-full">
                  {saving ? "Creating..." : "Create Class"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isTeacher && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Enter class join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="max-w-xs"
              />
              <Button onClick={joinClass} disabled={saving || !joinCode}>
                Join Class
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {classes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No classes yet</h2>
            <p className="text-muted-foreground">
              {isTeacher
                ? "Create your first class to get started"
                : "Join a class with a code from your teacher"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                {cls.subject && (
                  <p className="text-sm text-muted-foreground">{cls.subject}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">{cls._count.enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assignments</span>
                    <span className="font-medium">{cls._count.assignments}</span>
                  </div>
                  {isTeacher && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Join Code</span>
                      <div className="flex items-center gap-1">
                        <code className="bg-muted px-2 py-1 rounded font-mono">
                          {cls.joinCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyJoinCode(cls.joinCode)
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
