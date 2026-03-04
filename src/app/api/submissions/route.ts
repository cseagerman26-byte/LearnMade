import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { assignmentId, answers, score, percentage, xpEarned } = await req.json()

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        studentId: session.user.id,
        assignmentId,
      },
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: "Already submitted" },
        { status: 400 }
      )
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { questions: true },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const submission = await prisma.submission.create({
      data: {
        studentId: session.user.id,
        assignmentId,
        score,
        percentage,
        xpEarned,
        status: "SUBMITTED",
        submittedAt: new Date(),
        answers: {
          create: assignment.questions.map((q: { id: string; type: string; options: string | null; correctAnswer: string | null; points: number }) => {
            const userAnswer = answers[q.id]
            let isCorrect = false
            const opts = q.options ? JSON.parse(q.options) : []
            if (q.type === "MCQ") {
              isCorrect = userAnswer === opts[0]
            } else if (q.type === "TRUE_FALSE") {
              isCorrect = userAnswer === q.correctAnswer
            }
            return {
              questionId: q.id,
              answer: userAnswer,
              isCorrect,
              pointsEarned: isCorrect ? q.points : 0,
            }
          }),
        },
      },
    })

    await prisma.xPLog.create({
      data: {
        userId: session.user.id,
        amount: xpEarned,
        reason: `Completed: ${assignment.title}`,
      },
    })

    const totalXP = await prisma.xPLog.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true },
    })

    await prisma.streak.upsert({
      where: { userId: session.user.id },
      update: {
        currentStreak: { increment: 1 },
        longestStreak: { increment: 1 },
        lastActivity: new Date(),
      },
      create: {
        userId: session.user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastActivity: new Date(),
      },
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    )
  }
}
