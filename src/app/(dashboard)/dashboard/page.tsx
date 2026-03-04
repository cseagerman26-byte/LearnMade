import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Trophy, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { calculateLevel } from "@/lib/utils"
import { Leaderboard } from "@/components/gamification/leaderboard"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          class: {
            include: {
              teacher: true,
              assignments: {
                where: { isPublished: true },
                take: 5,
              },
            },
          },
        },
      },
      classesAsTeacher: {
        include: {
          enrollments: true,
          assignments: true,
        },
      },
      xpLogs: true,
      submissions: {
        include: {
          assignment: true,
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const totalXP = user.xpLogs.reduce((sum: number, log: { amount: number }) => sum + log.amount, 0)
  const { level, progress } = calculateLevel(totalXP)

  let leaderboardData: { name: string; xp: number; level: number }[] = []

  if (user.role === "STUDENT" && user.enrollments.length > 0) {
    const classId = user.enrollments[0].classId
    const students = await prisma.enrollment.findMany({
      where: { classId },
      include: {
        student: {
          include: {
            xpLogs: true,
          },
        },
      },
    })

    leaderboardData = students
      .map((e: { student: { name: string | null; xpLogs: { amount: number }[] } }) => ({
        name: e.student.name || "Unknown",
        xp: e.student.xpLogs.reduce((sum: number, log: { amount: number }) => sum + log.amount, 0),
        level: calculateLevel(
          e.student.xpLogs.reduce((sum: number, log: { amount: number }) => sum + log.amount, 0)
        ).level,
      }))
      .sort((a: { xp: number }, b: { xp: number }) => b.xp - a.xp)
      .slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {user.role === "TEACHER" ? (
        <TeacherDashboard user={user} />
      ) : (
        <StudentDashboard 
          user={user} 
          totalXP={totalXP} 
          level={level}
          progress={progress}
          leaderboard={leaderboardData}
        />
      )}
    </div>
  )
}

function TeacherDashboard({ user }: { user: any }) {
  const totalStudents = user.classesAsTeacher.reduce(
    (sum: number, cls: any) => sum + cls.enrollments.length,
    0
  )
  const totalAssignments = user.classesAsTeacher.reduce(
    (sum: number, cls: any) => sum + cls.assignments.length,
    0
  )

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100">My Classes</p>
                <p className="text-3xl font-bold">{user.classesAsTeacher.length}</p>
              </div>
              <Users className="h-10 w-10 text-violet-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Students</p>
                <p className="text-3xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Assignments</p>
                <p className="text-3xl font-bold">{totalAssignments}</p>
              </div>
              <FileText className="h-10 w-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100">Total XP Given</p>
                <p className="text-3xl font-bold">
                  {user.xpLogs.reduce((sum: number, log: any) => sum + log.amount, 0)}
                </p>
              </div>
              <Zap className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.classesAsTeacher.length === 0 ? (
              <p className="text-muted-foreground">No classes yet. Create your first class!</p>
            ) : (
              user.classesAsTeacher.slice(0, 4).map((cls: any) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.enrollments.length} students
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/classes/${cls.id}`}>View</Link>
                  </Button>
                </div>
              ))
            )}
            <Button asChild className="w-full">
              <Link href="/dashboard/classes">
                View All Classes <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/create-quiz">
                <FileText className="mr-2 h-4 w-4" />
                Create New Quiz
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/classes">
                <Users className="mr-2 h-4 w-4" />
                Manage Classes
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/leaderboard">
                <Trophy className="mr-2 h-4 w-4" />
                View Leaderboards
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StudentDashboard({
  user,
  totalXP,
  level,
  progress,
  leaderboard,
}: {
  user: any
  totalXP: number
  level: number
  progress: number
  leaderboard: { name: string; xp: number; level: number }[]
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100">Total XP</p>
                <p className="text-4xl font-bold">{totalXP.toLocaleString()}</p>
              </div>
              <Zap className="h-12 w-12 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100">Current Level</p>
                <p className="text-4xl font-bold">{level}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {level}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-2">Level Progress</p>
            <div className="space-y-2">
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-right text-muted-foreground">
                {progress}% to next level
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.enrollments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t joined any classes yet
                </p>
                <Button asChild>
                  <Link href="/dashboard/join-class">Join a Class</Link>
                </Button>
              </div>
            ) : (
              user.enrollments.slice(0, 4).map((enrollment: any) => (
                <div
                  key={enrollment.class.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{enrollment.class.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.class.teacher.name}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/classes/${enrollment.class.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                Join a class to see the leaderboard
              </p>
            ) : (
              <Leaderboard
                entries={leaderboard.map((entry, idx) => ({
                  rank: idx + 1,
                  name: entry.name,
                  xp: entry.xp,
                  level: entry.level,
                  isCurrentUser: entry.name === user.name,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {user.submissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No quizzes completed yet. Start learning!
            </p>
          ) : (
            <div className="space-y-3">
              {user.submissions.map((submission: any) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{submission.assignment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.percentage?.toFixed(0)}% • {submission.xpEarned} XP
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      submission.percentage >= 80
                        ? "bg-green-100 text-green-700"
                        : submission.percentage >= 60
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {submission.percentage?.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
