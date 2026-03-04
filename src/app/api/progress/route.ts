import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const xpLogs = await prisma.xPLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const submissions = await prisma.submission.findMany({
      where: { studentId: session.user.id },
    })

    const streak = await prisma.streak.findUnique({
      where: { userId: session.user.id },
    })

    const totalXP = xpLogs.reduce((sum: number, log: { amount: number }) => sum + log.amount, 0)
    const quizzesCompleted = submissions.length
    const averageScore =
      quizzesCompleted > 0
        ? submissions.reduce((sum: number, s: { percentage: number | null }) => sum + (s.percentage || 0), 0) /
          quizzesCompleted
        : 0

    return NextResponse.json({
      xpLogs,
      stats: {
        totalXP,
        quizzesCompleted,
        averageScore,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    )
  }
}
