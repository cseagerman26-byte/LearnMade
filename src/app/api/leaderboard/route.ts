import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateLevel } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 })
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { classId },
      include: {
        student: {
          include: {
            xpLogs: true,
          },
        },
      },
    })

    const leaderboard = enrollments
      .map((enrollment: { student: { id: string; name: string | null; xpLogs: { amount: number }[] } }) => {
        const totalXP = enrollment.student.xpLogs.reduce(
          (sum: number, log: { amount: number }) => sum + log.amount,
          0
        )
        const { level } = calculateLevel(totalXP)
        return {
          student: {
            id: enrollment.student.id,
            name: enrollment.student.name,
          },
          totalXP,
          level,
        }
      })
      .sort((a: { totalXP: number }, b: { totalXP: number }) => b.totalXP - a.totalXP)

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}
