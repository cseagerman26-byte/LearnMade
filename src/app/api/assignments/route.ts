import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { classId, title, description, xpValue, timeLimit, questions } = await req.json()

    const assignment = await prisma.assignment.create({
      data: {
        classId,
        title,
        description,
        xpValue: xpValue || 10,
        timeLimit,
        isPublished: false,
        questions: {
          create: questions.map((q: any, index: number) => ({
            text: q.text,
            type: q.type,
            points: q.points,
            correctAnswer: q.correctAnswer,
            options: JSON.stringify(q.options),
            order: index,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const assignmentId = searchParams.get("id")

    let assignments

    if (session.user.role === "TEACHER") {
      if (assignmentId) {
        assignments = await prisma.assignment.findUnique({
          where: { id: assignmentId },
          include: {
            questions: { orderBy: { order: "asc" } },
            class: true,
            submissions: {
              include: {
                student: true,
              },
            },
          },
        })
      } else if (classId) {
        assignments = await prisma.assignment.findMany({
          where: { classId },
          include: {
            _count: { select: { questions: true, submissions: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      } else {
        assignments = await prisma.assignment.findMany({
          where: { class: { teacherId: session.user.id } },
          include: {
            class: true,
            _count: { select: { questions: true, submissions: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      }
    } else {
      if (assignmentId) {
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: session.user.id,
            class: { assignments: { some: { id: assignmentId } } },
          },
        })

        if (!enrollment) {
          return NextResponse.json({ error: "Not enrolled" }, { status: 403 })
        }

        assignments = await prisma.assignment.findUnique({
          where: { id: assignmentId },
          include: {
            questions: { orderBy: { order: "asc" } },
            class: { include: { teacher: { select: { name: true } } } },
          },
        })
      } else if (classId) {
        const enrollments = await prisma.enrollment.findMany({
          where: { studentId: session.user.id, classId },
          include: {
            class: {
              include: {
                assignments: {
                  where: { isPublished: true },
                  include: {
                    _count: { select: { questions: true } },
                  },
                },
              },
            },
          },
        })
        assignments = enrollments.flatMap((e: { class: { assignments: any[] } }) => e.class.assignments)
      } else {
        const enrollments = await prisma.enrollment.findMany({
          where: { studentId: session.user.id },
          include: {
            class: {
              include: {
                assignments: {
                  where: { isPublished: true },
                  include: {
                    _count: { select: { questions: true } },
                  },
                },
              },
            },
          },
        })
        assignments = enrollments.flatMap((e: { class: { assignments: any[] } }) => e.class.assignments)
      }
    }

    return NextResponse.json(assignments)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}
